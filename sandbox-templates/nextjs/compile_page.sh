#!/bin/bash

# 这个脚本在构建沙箱模板时运行
# ping_server polls http://localhost:3000 until the server responds with HTTP 200, printing a periodic "等待服务器启动..." message while retrying.
function ping_server() {
	counter=0
	response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000")
	while [[ ${response} -ne 200 ]]; do
	  let counter++
	  if  (( counter % 20 == 0 )); then
        echo "等待服务器启动..."
        sleep 0.1
      fi

	  response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000")
	done
}

ping_server &
cd /home/user && npx next dev --turbopack


# compile_page.sh总结
# 它是一个 "预热启动器"。
# 如果不加这个脚本，当我在沙箱里打开你的应用时，Next.js 才会开始编译首页，
# 我起码要等 5-10 秒的白屏。这个脚本让这一切在后台提前完成