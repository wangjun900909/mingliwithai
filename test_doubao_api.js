#!/usr/bin/env node

/**
 * 豆包AI官方API测试脚本
 */

const TEST_MESSAGE = '你好，请简单介绍一下自己';

async function testDoubaoAPI() {
  console.log('🚀 测试豆包AI官方API...\n');
  console.log(`测试消息: "${TEST_MESSAGE}"`);
  
  try {
    const startTime = Date.now();
    
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 6397d7fc-8c2a-4f09-97c6-cbef59557aa7'
      },
      body: JSON.stringify({
        model: 'doubao-1-5-pro-32k-character-250228',
        messages: [
          {
            role: 'user',
            content: TEST_MESSAGE
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`📊 响应状态: ${response.status}`);
    console.log(`⏱️  响应时间: ${responseTime}ms`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ HTTP错误: ${response.status} - ${errorText}`);
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        responseTime
      };
    }
    
    const data = await response.json();
    console.log(`📄 响应数据:`, JSON.stringify(data, null, 2));
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const responseText = data.choices[0].message.content;
      console.log(`✅ 成功获取响应，长度: ${responseText.length} 字符`);
      console.log(`📝 响应内容: ${responseText.substring(0, 200)}...`);
      
      return {
        success: true,
        responseText,
        responseTime,
        data
      };
    } else {
      console.log(`⚠️  未知响应格式`);
      return {
        success: false,
        error: '未知响应格式',
        responseTime,
        data
      };
    }
    
  } catch (error) {
    console.log(`❌ 请求失败: ${error.message}`);
    return {
      success: false,
      error: error.message,
      responseTime: null
    };
  }
}

// 运行测试
testDoubaoAPI()
  .then((result) => {
    console.log('\n📋 测试结果:');
    console.log('='.repeat(50));
    
    if (result.success) {
      console.log(`✅ 测试成功`);
      console.log(`⏱️  响应时间: ${result.responseTime}ms`);
      console.log(`📝 响应长度: ${result.responseText.length} 字符`);
    } else {
      console.log(`❌ 测试失败: ${result.error}`);
    }
    
    console.log('\n✨ 测试完成');
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 测试过程中发生错误:', error);
    process.exit(1);
  }); 