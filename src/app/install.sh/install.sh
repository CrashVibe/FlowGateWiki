#!/usr/bin/env bash
# ============================================================
#   FlowGate Nexus — 交互式安装脚本
#   支持：原生二进制 / Docker / Docker Compose
# ============================================================

set -euo pipefail

# ── 颜色 & 样式 ─────────────────────────────────────────────
ESC=$'\033'
RESET="${ESC}[0m"
BOLD="${ESC}[1m"
DIM="${ESC}[2m"

BBLUE="${ESC}[1;34m"
BGREEN="${ESC}[1;32m"
BYELLOW="${ESC}[1;33m"
BRED="${ESC}[1;31m"
BCYAN="${ESC}[1;36m"
BWHITE="${ESC}[1;37m"
CYAN="${ESC}[0;36m"

# ── 默认值 ───────────────────────────────────────────────────
DEFAULT_INSTALL_DIR="/opt/flowgate"
INSTALL_DIR="$DEFAULT_INSTALL_DIR"
DOCKER_IMAGE="wlingxd/fgatenexus"
DOCKER_TAG="latest"
INSTALL_METHOD=""
IS_UPDATE=0        # 1 = 更新模式，跳过 config 初始化

# ════════════════════════════════════════════════════════════
#   box — 统一边框生成器
#
#   用法：
#     box "标题" "$COLOR" \
#       "行1" \
#       "行2" \
#       ...
#
#   COLOR 可传颜色变量（如 $BGREEN）或留空（""）表示无色。
#   标题为空时不绘制标题行和分隔线。
# ════════════════════════════════════════════════════════════
box() {
    local title="$1"
    local color="$2"
    shift 2
    local -a rows=("$@")

    # 计算字符串去 ANSI 后的可见宽度（正确处理 CJK/Emoji 等宽字符）
    # 优先用 python3（unicodedata），备用 perl 码点范围判断
    _vis() {
        printf '%s' "$1" \
        | sed -E 's/\x1B\[[0-9;]*[A-Za-z]//g' \
        | if command -v python3 &>/dev/null; then
            python3 -c "
import sys, unicodedata
s = sys.stdin.read()
print(sum(2 if unicodedata.east_asian_width(c) in ('W','F') else 1 for c in s))
"
          else
            perl -CS -e '
my $s = do { local $/; <STDIN> };
my $w = 0;
for my $cp (unpack("U*", $s)) {
    if (($cp >= 0x1100 && $cp <= 0x115F)  ||
        ($cp >= 0x2329 && $cp <= 0x232A)  ||
        ($cp >= 0x2E80 && $cp <= 0x303E)  ||
        ($cp >= 0x3041 && $cp <= 0x33BF)  ||
        ($cp >= 0x33FF && $cp <= 0xA4CF)  ||
        ($cp >= 0xA960 && $cp <= 0xA97F)  ||
        ($cp >= 0xAC00 && $cp <= 0xD7FF)  ||
        ($cp >= 0xF900 && $cp <= 0xFAFF)  ||
        ($cp >= 0xFE10 && $cp <= 0xFE1F)  ||
        ($cp >= 0xFE30 && $cp <= 0xFE6F)  ||
        ($cp >= 0xFF01 && $cp <= 0xFF60)  ||
        ($cp >= 0xFFE0 && $cp <= 0xFFE6)  ||
        ($cp >= 0x1F300 && $cp <= 0x1F9FF)||
        ($cp >= 0x20000 && $cp <= 0x2FA1F)) {
        $w += 2;
    } else {
        $w += 1;
    }
}
print "$w\n";
'
          fi
    }

    _line() {
        local text="$1"
        local vis_w
        vis_w=$(_vis "$text")
        local pad=$(( max - vis_w ))
        (( pad < 0 )) && pad=0
        printf '%s║%s %s%*s %s║%s\n' \
            "$color" "$RESET" \
            "$text" "$pad" "" \
            "$color" "$RESET"
    }

    # 计算
    local max=56
    local row w
    [[ -n "$title" ]] && {
        w=$(_vis "  + $title")
        (( w > max )) && max=$w
    }
    for row in "${rows[@]}"; do
        w=$(_vis "$row")
        (( w > max )) && max=$w
    done

    # 生成
    local border
    printf -v border '%*s' $(( max + 2 )) ''
    border="${border// /═}"

    # 绘制
    printf '%s╔%s╗%s\n' "$color" "$border" "$RESET"
    if [[ -n "$title" ]]; then
        _line "  + $title"
        printf '%s╠%s╣%s\n' "$color" "$border" "$RESET"
    fi
    for row in "${rows[@]}"; do
        _line "$row"
    done
    printf '%s╚%s╝%s\n' "$color" "$border" "$RESET"
}

# ── 辅助函数 ─────────────────────────────────────────────────

print_banner() {
    echo ""
    echo -e "${BBLUE}╔══════════════════════════════════════════════════════╗${RESET}"
    echo -e "${BBLUE}║                                                      ║${RESET}"
    echo -e "${BBLUE}║${RESET}  ${BCYAN}███████╗██╗      ██████╗ ██╗    ██╗${RESET}                 ${BBLUE}║${RESET}"
    echo -e "${BBLUE}║${RESET}  ${BCYAN}██╔════╝██║     ██╔═══██╗██║    ██║${RESET}                 ${BBLUE}║${RESET}"
    echo -e "${BBLUE}║${RESET}  ${BCYAN}█████╗  ██║     ██║   ██║██║ █╗ ██║${RESET}                 ${BBLUE}║${RESET}"
    echo -e "${BBLUE}║${RESET}  ${CYAN}██╔══╝  ██║     ██║   ██║██║███╗██║${RESET}                 ${BBLUE}║${RESET}"
    echo -e "${BBLUE}║${RESET}  ${CYAN}██║     ███████╗╚██████╔╝╚███╔███╔╝${RESET}  ${BWHITE}G A T E${RESET}        ${BBLUE}║${RESET}"
    echo -e "${BBLUE}║${RESET}  ${CYAN}╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝${RESET}                  ${BBLUE}║${RESET}"
    echo -e "${BBLUE}║                                                      ║${RESET}"
    echo -e "${BBLUE}║${RESET}  ${DIM}FGateNexus 交互式安装程序  v0.0.1${RESET}                   ${BBLUE}║${RESET}"
    echo -e "${BBLUE}║${RESET}  ${DIM}https://github.com/CrashVibe/FGateNexus${RESET}             ${BBLUE}║${RESET}"
    echo -e "${BBLUE}║                                                      ║${RESET}"
    echo -e "${BBLUE}╚══════════════════════════════════════════════════════╝${RESET}"
    echo ""
}

print_step() {
    echo ""
    echo -e "${BBLUE}┌─${RESET} ${BOLD}$1${RESET}"
}

print_info()  { echo -e "  ${CYAN}i${RESET}  $1"; }
print_ok()    { echo -e "  ${BGREEN}+${RESET}  $1"; }
print_warn()  { echo -e "  ${BYELLOW}!${RESET}  $1"; }
print_error() { echo -e "  ${BRED}x${RESET}  $1" >&2; }
print_sep()   { echo -e "${DIM}  ──────────────────────────────────────────${RESET}"; }

ask() {
    local prompt="$1"
    local varname="$2"
    local default="${3:-}"
    local input
    if [[ -n "$default" ]]; then
        echo -ne "  ${BWHITE}>${RESET}  ${prompt} ${DIM}[默认: ${default}]${RESET}: "
    else
        echo -ne "  ${BWHITE}>${RESET}  ${prompt}: "
    fi
    read -r input
    if [[ -z "$input" && -n "$default" ]]; then
        printf -v "$varname" '%s' "$default"
    else
        printf -v "$varname" '%s' "$input"
    fi
}

# ── 检测架构 ──────────────────────────────────────────────────
detect_arch() {
    local arch
    arch=$(uname -m)
    case "$arch" in
        x86_64)        echo "x64" ;;
        aarch64|arm64) echo "arm64" ;;
        *)
            print_error "不支持的架构：$arch（仅支持 x64 / ARM64）"
            exit 1
            ;;
    esac
}

# ── 从 GitHub 获取最新版本号 ──────────────────────────────────
fetch_latest_version() {
    local api_url="https://api.github.com/repos/CrashVibe/FGateNexus/releases/latest"
    local version=""

    if command -v curl &>/dev/null; then
        version=$(curl -fsSL "$api_url" \
            | grep '"tag_name"' | head -1 \
            | sed 's/.*"tag_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
    elif command -v wget &>/dev/null; then
        version=$(wget -qO- "$api_url" \
            | grep '"tag_name"' | head -1 \
            | sed 's/.*"tag_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
    else
        print_error "未找到 curl 或 wget，请先安装其中之一。"
        exit 1
    fi

    if [[ -z "$version" ]]; then
        print_error "无法获取最新版本号，请检查网络连接或 GitHub 访问权限。"
        exit 1
    fi

    echo "$version"
}

# ── 下载并解压二进制 ──────────────────────────────────────────
download_binary() {
    local arch="$1"
    local dest_dir="$2"

    print_info "正在获取最新版本信息..." >&2
    local version
    version=$(fetch_latest_version)
    print_ok "最新版本：${BOLD}${version}${RESET}" >&2

    local tarball="FGateNexus-${version}-linux-${arch}.tar.gz"
    local download_url="https://github.com/CrashVibe/FGateNexus/releases/download/${version}/${tarball}"

    print_info "正在下载 ${BOLD}${tarball}${RESET} ..." >&2

    local tmp_dir
    tmp_dir=$(mktemp -d)
    local tmp_tar="${tmp_dir}/${tarball}"

    if command -v curl &>/dev/null; then
        if ! curl -fSL --no-progress-meter -o "$tmp_tar" "$download_url" 2>&2; then
            print_error "下载失败，请检查网络连接。" >&2
            rm -rf "$tmp_dir"
            exit 1
        fi
    else
        if ! wget -q -O "$tmp_tar" "$download_url" 2>&2; then
            print_error "下载失败，请检查网络连接。" >&2
            rm -rf "$tmp_dir"
            exit 1
        fi
    fi

    print_ok "下载完成，正在解压..." >&2
    tar -xzf "$tmp_tar" -C "$tmp_dir"
    rm -f "$tmp_tar"

    local binary_name="FGateNexus-linux-${arch}"
    local extracted
    extracted=$(find "$tmp_dir" -name "$binary_name" | head -1)

    if [[ -z "$extracted" ]]; then
        print_error "解压后未找到 ${binary_name}，压缩包结构可能有变化。" >&2
        rm -rf "$tmp_dir"
        exit 1
    fi

    cp "$extracted" "${dest_dir}/${binary_name}"
    chmod +x "${dest_dir}/${binary_name}"
    rm -rf "$tmp_dir"

    print_ok "已安装：${BOLD}${dest_dir}/${binary_name}${RESET}" >&2

    # 唯一走 stdout 的内容
    echo "$version"
}

# ── 检查命令是否存在 ──────────────────────────────────────────
require_cmd() {
    if ! command -v "$1" &>/dev/null; then
        print_error "未找到命令：${BOLD}$1${RESET}"
        print_info "请先安装 $1，然后重新运行此脚本。"
        exit 1
    fi
}

# ── Docker 缺失时提示安装 ──────────────────────────────────
ensure_docker() {
    command -v docker &>/dev/null && return 0

    print_warn "未检测到 Docker。"
    local ans
    ask "是否现在安装 Docker？(y/n)" ans "y"
    [[ "$ans" =~ ^[Yy]$ ]] || { print_info "已取消安装，退出。"; exit 0; }

    local country
    country=$(curl -s ipinfo.io/country 2>/dev/null || echo "")
    print_info "当前服务器位置：${BOLD}${country:-未知}${RESET}"

    local tmp_script
    tmp_script=$(mktemp /tmp/docker-install-XXXXXX.sh)

    print_info "正在下载 Docker 安装脚本..."
    local url="https://get.docker.com"
    [[ "$country" == "CN" ]] && url="https://linuxmirrors.cn/docker.sh"
    curl -fsSL "$url" -o "$tmp_script"
    chmod +x "$tmp_script"

    tput smcup 2>/dev/null && tput clear 2>/dev/null
    bash "$tmp_script"
    local exit_code=$?
    rm -f "$tmp_script"
    tput rmcup 2>/dev/null

    echo ""
    if [[ $exit_code -ne 0 ]]; then
        print_error "Docker 安装失败（退出码 ${exit_code}），请手动安装后重试。"
        exit 1
    fi

    require_cmd docker
    print_ok "Docker 安装完成！"
    echo ""
}

# ════════════════════════════════════════════════════════════
#   已安装检测 — 公共提示框
#
#   check_existing_prompt <类型描述> <路径信息行...>
#   返回 0 = 用户选择继续（更新），1 = 用户选择退出
# ════════════════════════════════════════════════════════════
check_existing_prompt() {
    local kind="$1"
    shift
    local -a info_lines=("$@")

    echo ""
    box "检测到已安装的 ${kind}" "$BYELLOW" \
        "" \
        "${info_lines[@]}" \
        "" \
        "  将拉取 ${BOLD}最新版本${RESET} 覆盖旧版本并重启服务。" \
        "  config 目录与数据目录${BOLD}不会被改动${RESET}。" \
        ""

    echo ""
    local ans
    ask "是否继续更新？(y/n)" ans "y"
    [[ "$ans" =~ ^[Yy]$ ]]
}

# ── 原生二进制：检测是否已安装 ───────────────────────────────
check_existing_binary() {
    local dir="$1"
    local arch="$2"
    local binary="${dir}/FGateNexus-linux-${arch}"

    [[ -f "$binary" ]] || return 0   # 未安装，直接放行

    IS_UPDATE=1
    check_existing_prompt "原生二进制" \
        "  安装目录 : ${dir}"
}

# ── Docker CLI：检测是否已安装 ───────────────────────────────
check_existing_docker() {
    docker ps -a --format '{{.Names}}' 2>/dev/null | grep -q '^fgatenexus$' || return 0

    IS_UPDATE=1
    check_existing_prompt "Docker 容器" \
        "  容器名称 : fgatenexus"
}

# ── Docker Compose：检测是否已安装 ──────────────────────────
check_existing_compose() {
    local dir="$1"
    local compose_file="${dir}/docker-compose.yml"

    [[ -f "$compose_file" ]] || return 0

    IS_UPDATE=1
    check_existing_prompt "Docker Compose" \
        "  部署目录 : ${dir}"
}

# ════════════════════════════════════════════════════════════
#   应用配置（Sentry / Host / Port）
#   $1 = config 目录路径
# ════════════════════════════════════════════════════════════
setup_appsettings() {
    local config_dir="$1"
    local koishi_host="$2"
    local koishi_port="$3"
    local nitro_host="$4"
    local nitro_port="$5"

    # 更新模式下若配置已存在，直接跳过
    if [[ "$IS_UPDATE" -eq 1 && -f "${config_dir}/appsettings.json" ]]; then
        print_info "检测到已有 Sentry 配置，跳过此步骤。"
        return
    fi

    echo ""
    box "帮助我们改进 FGateNexus" "$BCYAN" \
        "" \
        "  FGateNexus 使用 Sentry 收集匿名崩溃报告与错误堆栈。" \
        "" \
        "  ${BWHITE}为什么这对我们很重要？${RESET}" \
        "  • 我们是一个小团队，无法在所有环境中复现每个 bug。" \
        "  • Sentry 报告让我们在用户反馈之前就能定位并修复问题。" \
        "  • 报告${BOLD}仅包含错误堆栈与运行时元数据${RESET}，不含任何配置或隐私数据。" \
        "  • 数据仅供 CrashVibe 团队内部使用，绝不共享给第三方。" \
        "" \
        "  开启此选项，您将直接帮助我们提升每一位用户的使用体验。" \
        "  感谢您的支持！❤" \
        ""

    echo ""
    local sentry_choice
    ask "是否启用 Sentry 错误上报？(y/n)" sentry_choice "y"

    local sentry_enabled="false"
    if [[ "$sentry_choice" =~ ^[Yy]$ ]]; then
        sentry_enabled="true"
    fi

    # 写入 appsettings.json
        cat > "${config_dir}/appsettings.json" << EOF
{
    "sentry": {
        "enabled": ${sentry_enabled}
    },
    "koishi": {
        "host": "${koishi_host}",
        "port": ${koishi_port}
    },
    "nitro": {
        "host": "${nitro_host}",
        "port": ${nitro_port}
    }
}
EOF

    if [[ "$sentry_enabled" == "true" ]]; then
        print_ok "Sentry 已启用，感谢您帮助我们改进产品！"
    else
        print_info "Sentry 已禁用。您可以随时编辑 ${config_dir}/appsettings.json 重新开启。"
    fi
}

# ════════════════════════════════════════════════════════════
#   安装方式选择菜单
# ════════════════════════════════════════════════════════════
menu_install_method() {
    print_step "选择安装方式"
    echo ""
    echo -e "  ${BWHITE}[1]${RESET}  ${BGREEN}原生二进制${RESET}     — 直接运行可执行文件（推荐）"
    echo -e "  ${BWHITE}[2]${RESET}  ${BCYAN}Docker CLI${RESET}      — 使用 docker run 启动容器"
    echo -e "  ${BWHITE}[3]${RESET}  ${BBLUE}Docker Compose${RESET}  — 使用 docker-compose.yml（推荐生产环境）"
    echo ""
    local choice
    while true; do
        ask "请输入选项 (1/2/3)" choice "1"
        case "$choice" in
            1) INSTALL_METHOD="binary";  break ;;
            2) INSTALL_METHOD="docker";  break ;;
            3) INSTALL_METHOD="compose"; break ;;
            *) print_warn "请输入 1、2 或 3" ;;
        esac
    done
}

# ════════════════════════════════════════════════════════════
#   原生二进制安装
# ════════════════════════════════════════════════════════════
install_binary() {
    print_step "原生二进制安装"
    print_sep

    local arch
    arch=$(detect_arch)
    print_info "检测到系统架构：${BOLD}${arch}${RESET}"
    local binary_name="FGateNexus-linux-${arch}"

    echo ""
    ask "安装目录" INSTALL_DIR "$DEFAULT_INSTALL_DIR"

    # ── 已安装检测 ──────────────────────────────────────────
    if ! check_existing_binary "$INSTALL_DIR" "$arch"; then
        print_info "已取消，退出安装程序。"
        exit 0
    fi

    local enable_autostart
    ask "是否开机自动启动？(y/n)" enable_autostart "y"

    local koishi_host koishi_port nitro_host nitro_port
    ask "Koishi Host" koishi_host "0.0.0.0"
    ask "Koishi 端口" koishi_port "5140"
    ask "Nitro Host" nitro_host "0.0.0.0"
    ask "Nitro 端口" nitro_port "3000"

    echo ""
    print_info "正在创建目录：${BOLD}${INSTALL_DIR}${RESET}"
    mkdir -p "${INSTALL_DIR}/config"

    # 更新前停止正在运行的服务
    if systemctl is-active --quiet fgatenexus 2>/dev/null; then
        print_info "正在停止旧服务..."
        systemctl stop fgatenexus
        print_ok "旧服务已停止"
    fi

    setup_appsettings "${INSTALL_DIR}/config" "$koishi_host" "$koishi_port" "$nitro_host" "$nitro_port"

    print_sep
    local installed_version
    installed_version=$(download_binary "$arch" "$INSTALL_DIR")

    print_sep
    print_info "正在安装 systemd 服务..."
    local service_file="/etc/systemd/system/fgatenexus.service"
    cat > "$service_file" << EOF
[Unit]
Description=FGateNexus Service
After=network.target

[Service]
Type=simple
WorkingDirectory=${INSTALL_DIR}
ExecStart=${INSTALL_DIR}/${binary_name}
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    print_ok "systemd 服务文件已安装"

    if [[ "$enable_autostart" =~ ^[Yy]$ ]]; then
        systemctl enable fgatenexus
        systemctl start fgatenexus
        print_ok "已启用开机自启，服务已启动"
    else
        systemctl start fgatenexus
        print_ok "服务已启动（未设置开机自启）"
        print_info "如需开机自启，执行：systemctl enable fgatenexus"
    fi

    echo ""
    local nitro_host_label koishi_host_label
    nitro_host_label="$nitro_host"
    koishi_host_label="$koishi_host"
    if [[ "$nitro_host" != "127.0.0.1" ]]; then
        nitro_host_label="<服务器IP>"
    fi
    if [[ "$koishi_host" != "127.0.0.1" ]]; then
        koishi_host_label="<服务器IP>"
    fi
    box "安装完成！" "$BGREEN" \
        "" \
        "  版本号   : ${BCYAN}${installed_version}${RESET}" \
        "  安装目录 : ${INSTALL_DIR}" \
        "  Web UI   : http://${nitro_host_label}:${nitro_port}" \
        "  Koishi   : http://${koishi_host_label}:${koishi_port}" \
        "" \
        "  常用命令：" \
        "  ${CYAN}systemctl status  fgatenexus${RESET}  查看状态" \
        "  ${CYAN}systemctl restart fgatenexus${RESET}  重启服务" \
        "  ${CYAN}journalctl -fu    fgatenexus${RESET}  实时日志" \
        ""
    echo ""
}

# ════════════════════════════════════════════════════════════
#   Docker CLI 安装
# ════════════════════════════════════════════════════════════
install_docker() {
    print_step "Docker CLI 安装"
    print_sep

    ensure_docker

    ask "镜像 Tag（例如 latest / 0.3.4）" DOCKER_TAG "latest"

    local data_dir
    ask "宿主机数据目录" data_dir "$DEFAULT_INSTALL_DIR"

    local port_web port_koishi
    ask "Web UI 端口" port_web "3000"
    ask "Koishi 端口" port_koishi "5140"

    # ── 已安装检测 ──────────────────────────────────────────
    if ! check_existing_docker; then
        print_info "已取消，退出安装程序。"
        exit 0
    fi

    echo ""
    print_info "正在拉取镜像：${BOLD}${DOCKER_IMAGE}:${DOCKER_TAG}${RESET}"
    docker pull "${DOCKER_IMAGE}:${DOCKER_TAG}"

    print_info "创建数据目录..."
    mkdir -p "${data_dir}/config" "${data_dir}/data"

    setup_appsettings "${data_dir}/config" "0.0.0.0" "$port_koishi" "0.0.0.0" "$port_web"

    if docker ps -a --format '{{.Names}}' | grep -q '^fgatenexus$'; then
        print_info "正在移除旧容器..."
        docker rm -f fgatenexus
        print_ok "旧容器已移除"
    fi

    print_info "启动容器..."
    docker run -d \
        --name fgatenexus \
        --restart unless-stopped \
        -p "${port_web}:3000" \
        -p "${port_koishi}:5140" \
        -v "${data_dir}/config:/app/config" \
        -v "${data_dir}/data:/app/data" \
        "${DOCKER_IMAGE}:${DOCKER_TAG}"

    print_ok "容器已启动：${BOLD}fgatenexus${RESET}"

    echo ""
    box "Docker 安装完成！" "$BGREEN" \
        "" \
        "  数据目录 : ${data_dir}" \
        "  Web UI   : http://<服务器IP>:${port_web}" \
        "  Koishi   : http://<服务器IP>:${port_koishi}" \
        "" \
        "  常用命令：" \
        "  ${CYAN}docker logs -f fgatenexus${RESET}  实时日志" \
        "  ${CYAN}docker restart fgatenexus${RESET}  重启容器" \
        "  ${CYAN}docker stop    fgatenexus${RESET}  停止容器" \
        ""
    echo ""
}

# ════════════════════════════════════════════════════════════
#   Docker Compose 安装
# ════════════════════════════════════════════════════════════
install_compose() {
    print_step "Docker Compose 安装"
    print_sep

    ensure_docker

    local compose_cmd=""
    if docker compose version &>/dev/null 2>&1; then
        compose_cmd="docker compose"
    elif command -v docker-compose &>/dev/null; then
        compose_cmd="docker-compose"
    else
        print_error "未找到 docker compose 或 docker-compose，请先安装 Docker Compose。"
        exit 1
    fi
    print_ok "检测到 Compose：${BOLD}${compose_cmd}${RESET}"

    ask "镜像 Tag（例如 latest / v1.0.0）" DOCKER_TAG "latest"

    local deploy_dir
    ask "部署目录（将在此生成 docker-compose.yml）" deploy_dir "$DEFAULT_INSTALL_DIR"

    local port_web port_koishi
    ask "Web UI 宿主机端口" port_web "3000"
    ask "Koishi  宿主机端口" port_koishi "5140"

    # ── 已安装检测 ──────────────────────────────────────────
    if ! check_existing_compose "$deploy_dir"; then
        print_info "已取消，退出安装程序。"
        exit 0
    fi

    echo ""
    print_info "正在创建部署目录：${BOLD}${deploy_dir}${RESET}"
    mkdir -p "${deploy_dir}/config" "${deploy_dir}/data"

    setup_appsettings "${deploy_dir}/config" "0.0.0.0" "$port_koishi" "0.0.0.0" "$port_web"

    # 更新前停止旧服务
    if [[ -f "${deploy_dir}/docker-compose.yml" ]]; then
        print_info "正在停止旧服务..."
        (cd "$deploy_dir" && $compose_cmd down 2>/dev/null) || true
        print_ok "旧服务已停止"
    fi

    local compose_file="${deploy_dir}/docker-compose.yml"
    cat > "$compose_file" << EOF
services:
  fgatenexus:
    image: ${DOCKER_IMAGE}:${DOCKER_TAG}
    container_name: fgatenexus
    restart: unless-stopped
    ports:
      - "${port_web}:3000"
      - "${port_koishi}:5140"
    volumes:
      - ./config:/app/config
      - ./data:/app/data
EOF

    print_ok "已生成：${BOLD}${compose_file}${RESET}"
    print_info "正在拉取镜像并启动..."
    cd "$deploy_dir"
    $compose_cmd pull
    $compose_cmd up -d
    print_ok "服务已通过 Docker Compose 启动！"

    echo ""
    box "Docker Compose 安装完成！" "$BGREEN" \
        "" \
        "  部署目录 : ${deploy_dir}" \
        "  Web UI   : http://<服务器IP>:${port_web}" \
        "  Koishi   : http://<服务器IP>:${port_koishi}" \
        "" \
        "  常用命令（在部署目录下执行）：" \
        "  ${CYAN}${compose_cmd} logs -f${RESET}                      实时日志" \
        "  ${CYAN}${compose_cmd} restart${RESET}                      重启服务" \
        "  ${CYAN}${compose_cmd} down${RESET}                         停止并移除" \
        "  ${CYAN}${compose_cmd} pull && ${compose_cmd} up -d${RESET}  更新镜像" \
        ""
    echo ""
}

# ════════════════════════════════════════════════════════════
#   主流程
# ════════════════════════════════════════════════════════════
main() {
    if [[ $EUID -ne 0 ]]; then
        echo ""
        echo -e "${BYELLOW}!  建议以 root 权限运行此脚本（sudo ./install.sh）${RESET}"
        echo -e "   ${DIM}安装到 /opt 及配置 systemd 需要管理员权限。${RESET}"
        echo ""
        local cont
        read -rp "  是否继续？(y/N): " cont
        [[ "$cont" =~ ^[Yy]$ ]] || exit 0
    fi

    print_banner

    echo -e "  ${DIM}欢迎使用 FlowGate Nexus 安装程序。${RESET}"
    echo -e "  ${DIM}请根据提示完成安装配置，按 Ctrl+C 随时退出。${RESET}"
    echo ""

    menu_install_method

    case "$INSTALL_METHOD" in
        binary)  install_binary  ;;
        docker)  install_docker  ;;
        compose) install_compose ;;
    esac
}

main "$@"
