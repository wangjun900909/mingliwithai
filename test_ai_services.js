#!/usr/bin/env node

/**
 * AI服务测试脚本
 * 用于测试修复后的AI服务调用
 */

// 测试配置
const TEST_CONFIG = {
  services: [
    {
      name: 'DeepSeek',
      url: 'https://deepseek-production-c479.up.railway.app',
      endpoint: '/api/chat'
    },
    {
      name: '豆包AI',
      url: 'https://doubao-production-53b8.up.railway.app',
      endpoint: '/api/chat'
    },
    {
      name: '元宝AI',
      url: 'https://yuanbao-production.up.railway.app',
      endpoint: '/api/chat'
    }
  ],
  testMessage: '你好，请简单介绍一下自己',
  timeout: 30000
};

// 测试单个服务
async function testService(service) {
  console.log(`\n🔍 测试 ${service.name} 服务...`);
  console.log(`URL: ${service.url}${service.endpoint}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TEST_CONFIG.timeout);
    
    const startTime = Date.now();
    
    const response = await fetch(`${service.url}${service.endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; AI-Chat-App/1.0)',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        message: TEST_CONFIG.testMessage,
        max_tokens: 500,
        temperature: 0.7
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`📊 响应状态: ${response.status}`);
    console.log(`⏱️  响应时间: ${responseTime}ms`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ HTTP错误: ${response.status} - ${errorText}`);
      return {
        service: service.name,
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        responseTime
      };
    }
    
    const data = await response.json();
    console.log(`📄 响应数据:`, JSON.stringify(data, null, 2));
    
    // 检查响应格式
    let responseText = '';
    if (data.success && data.response) {
      responseText = data.response;
    } else if (data.final_result) {
      responseText = data.final_result;
    } else if (data.response) {
      responseText = data.response;
    } else if (data.data && data.data.response) {
      responseText = data.data.response;
    } else {
      console.log(`⚠️  未知响应格式`);
      return {
        service: service.name,
        success: false,
        error: '未知响应格式',
        responseTime,
        data
      };
    }
    
    console.log(`✅ 成功获取响应，长度: ${responseText.length} 字符`);
    console.log(`📝 响应内容: ${responseText.substring(0, 100)}...`);
    
    return {
      service: service.name,
      success: true,
      responseText,
      responseTime,
      data
    };
    
  } catch (error) {
    console.log(`❌ 请求失败: ${error.message}`);
    return {
      service: service.name,
      success: false,
      error: error.message,
      responseTime: null
    };
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 开始AI服务测试...\n');
  console.log(`测试消息: "${TEST_CONFIG.testMessage}"`);
  console.log(`超时设置: ${TEST_CONFIG.timeout}ms`);
  
  const results = [];
  
  for (const service of TEST_CONFIG.services) {
    const result = await testService(service);
    results.push(result);
  }
  
  // 输出测试总结
  console.log('\n📋 测试总结:');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ 成功: ${successful.length}/${results.length}`);
  console.log(`❌ 失败: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log('\n✅ 成功的服务:');
    successful.forEach(result => {
      console.log(`  - ${result.service}: ${result.responseTime}ms`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ 失败的服务:');
    failed.forEach(result => {
      console.log(`  - ${result.service}: ${result.error}`);
    });
  }
  
  // 推荐最佳服务
  if (successful.length > 0) {
    const fastest = successful.reduce((prev, current) => 
      prev.responseTime < current.responseTime ? prev : current
    );
    console.log(`\n🏆 推荐服务: ${fastest.service} (最快响应: ${fastest.responseTime}ms)`);
  } else {
    console.log('\n⚠️  所有服务都失败了，请检查服务状态');
  }
  
  return results;
}

// 如果直接运行此脚本
if (require.main === module) {
  runAllTests()
    .then(() => {
      console.log('\n✨ 测试完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 测试过程中发生错误:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests, testService }; 