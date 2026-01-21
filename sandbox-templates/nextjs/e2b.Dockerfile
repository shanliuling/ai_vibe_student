# 你可以使用大多数基于 Debian 的基础镜像
# FROM node:21-slim 这行代码的意思是：“老板，给我来台装好 Node.js 21 的电脑，系统要用轻量版 (slim) 的 Debian(Linux 操作系统)。”
FROM node:21-slim

# 安装 curl (一个命令行版的下载工具)
 
RUN apt-get update && apt-get install -y curl && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY compile_page.sh /compile_page.sh
RUN chmod +x /compile_page.sh

# 安装依赖并自定义沙箱
WORKDIR /home/user/nextjs-app

RUN npx --yes create-next-app@15.3.6 . --yes

RUN npx --yes shadcn@2.6.3 init --yes -b neutral --force
RUN npx --yes shadcn@2.6.3 add --all --yes

# 将 Next.js 应用移动到主目录并删除 nextjs-app 目录
RUN mv /home/user/nextjs-app/* /home/user/ && rm -rf /home/user/nextjs-app


# 总结
# 这个文件的意思是：“请帮我弄一台装了 Debian 系统和 Node.js 21 的电脑 (Docker)，
# 在里面装个下载工具 (curl)，然后把 Next.js 和 Shadcn UI 全套都给我装好，打包好随时准备干活。”