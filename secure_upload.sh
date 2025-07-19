#!/bin/zsh

# 配置新密钥对（更安全）
ssh-keygen -t ed25519 -f ~/.ssh/minglidays_deploy -N "" -C "minglidays-deploy-key"

# 添加新公钥到 GitHub
echo "请将以下公钥添加到 GitHub:"
cat ~/.ssh/minglidays_deploy.pub
echo "按 Enter 继续..."
read

# 配置仓库
git init
git config user.name "wangjun900909"
git config user.email "96786187+wangjun900909@users.noreply.github.com"
git remote add origin git@github.com:wangjun900909/minglidays.git

# 创建安全忽略规则
cat > .gitignore <<EOL
node_modules/
.next/
.env
*.env
.DS_Store
*.log
*.docx
*.pdf
allday.docx
原版366生日生命灵数全书.docx
零数的使用.docx
EOL

# 添加并提交代码
git add .
git commit -m "紧急安全上传: $(date +'%Y%m%d-%H%M%S')"

# 使用新密钥推送
ssh-add -D
ssh-add ~/.ssh/minglidays_deploy
GIT_SSH_COMMAND="ssh -i ~/.ssh/minglidays_deploy" git push -u origin main --force

echo "✅ 安全上传完成！"
echo "👉 访问: https://github.com/wangjun900909/minglidays"
