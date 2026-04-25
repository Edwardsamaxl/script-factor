/**
 * Persona Generator Tests
 * 测试人设生成服务
 *
 * 运行方式:
 *   cp .env.example .env
 *   # 编辑 .env 填入 DEEPSEEK_API_KEY
 *   node test/persona.test.js
 */

import { generatePersona } from '../services/personaGenerator.js';

// 测试辅助函数
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertValidPersona(persona) {
  assert(persona && typeof persona === 'object', 'Persona should be an object');
  assert(persona.id && typeof persona.id === 'string', 'Persona should have valid id');
  assert(persona.name && typeof persona.name === 'string', 'Persona should have valid name');
  assert(Array.isArray(persona.personality), 'Persona personality should be an array');
  assert(Array.isArray(persona.views), 'Persona views should be an array');
  assert(typeof persona.speakingStyle === 'string', 'Persona speakingStyle should be a string');
}

// ============================================
// 测试用例
// ============================================

/**
 * TEST 1: 输入完整表单 → 输出有效 JSON
 */
async function testCompleteInput() {
  console.log('\n=== Test 1: Complete Input ===');

  const input = {
    name: '毒舌评论家老王',
    personality: ['犀利', '幽默', '感性'],
    speakingStyle: '直接犀利，喜欢用比喻讽刺，语速快',
    views: [
      '烂片就该骂，不能惯着',
      '现在的电影越来越不用心',
      '评分虚高都是刷出来的'
    ],
    background: '资深影评人，十年观影经验'
  };

  try {
    const persona = await generatePersona(input);
    console.log('Generated Persona:', JSON.stringify(persona, null, 2));

    assertValidPersona(persona);
    assert(persona.name.includes('老王') || persona.name.includes('毒舌'), 'Name should expand naturally');

    console.log('✅ Test 1 PASSED');
    return true;
  } catch (error) {
    console.log(`❌ Test 1 FAILED: ${error.message}`);
    return false;
  }
}

/**
 * TEST 2: 输入只有 name + speakingStyle → 能否合理补全
 */
async function testMinimalInput() {
  console.log('\n=== Test 2: Minimal Input (name + speakingStyle only) ===');

  const input = {
    name: '佛系观众',
    speakingStyle: '语气平和，喜欢说"还行吧"'
  };

  try {
    const persona = await generatePersona(input);
    console.log('Generated Persona:', JSON.stringify(persona, null, 2));

    assertValidPersona(persona);
    assert(persona.personality.length > 0, 'Personality should be generated');
    assert(persona.views.length >= 3, 'Views should be generated (at least 3)');

    console.log('✅ Test 2 PASSED');
    return true;
  } catch (error) {
    console.log(`❌ Test 2 FAILED: ${error.message}`);
    return false;
  }
}

/**
 * TEST 3a: 空字段输入
 */
async function testEmptyInput() {
  console.log('\n=== Test 3a: Empty Fields ===');

  const input = {
    name: '',
    personality: [],
    speakingStyle: '',
    views: []
  };

  try {
    const persona = await generatePersona(input);
    console.log('Generated Persona:', JSON.stringify(persona, null, 2));

    // 空输入也应该返回有效结构（使用默认值）
    assertValidPersona(persona);

    console.log('✅ Test 3a PASSED');
    return true;
  } catch (error) {
    console.log(`❌ Test 3a FAILED: ${error.message}`);
    return false;
  }
}

/**
 * TEST 3b: 特殊字符输入
 */
async function testSpecialCharacters() {
  console.log('\n=== Test 3b: Special Characters ===');

  const input = {
    name: '测试"姓名"<script>',
    personality: ['激进&分裂', "emoji表情😀"],
    speakingStyle: '说: "你好" & \'再见\'',
    views: ['观点1\n换行', '观点2\t制表']
  };

  try {
    const persona = await generatePersona(input);
    console.log('Generated Persona:', JSON.stringify(persona, null, 2));

    assertValidPersona(persona);

    console.log('✅ Test 3b PASSED');
    return true;
  } catch (error) {
    console.log(`❌ Test 3b FAILED: ${error.message}`);
    return false;
  }
}

/**
 * TEST 4: 极端输入 - 超长文本
 */
async function testLongInput() {
  console.log('\n=== Test 4: Extreme Long Input ===');

  const input = {
    name: 'A'.repeat(100),
    personality: ['标签1', '标签2', '标签3'],
    speakingStyle: 'B'.repeat(500),
    views: ['C'.repeat(200), 'D'.repeat(200)],
    background: 'E'.repeat(1000)
  };

  try {
    const persona = await generatePersona(input);
    console.log('Generated Persona (truncated):', {
      id: persona.id,
      name: persona.name?.substring(0, 50),
      personalityLength: persona.personality?.length,
      speakingStyleLength: persona.speakingStyle?.length,
      viewsCount: persona.views?.length
    });

    assertValidPersona(persona);

    console.log('✅ Test 4 PASSED');
    return true;
  } catch (error) {
    console.log(`❌ Test 4 FAILED: ${error.message}`);
    return false;
  }
}

// ============================================
// 运行测试
// ============================================

async function runTests() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║      Persona Generator Tests           ║');
  console.log('╚════════════════════════════════════════╝');

  // 检查 API Key
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.log('\n⚠️  WARNING: DEEPSEEK_API_KEY not set in .env');
    console.log('   Tests requiring LLM calls will fail.');
    console.log('   Copy .env.example to .env and add your API key.\n');
  }

  const results = [];

  // 运行所有测试
  results.push(await testCompleteInput());
  results.push(await testMinimalInput());
  results.push(await testEmptyInput());
  results.push(await testSpecialCharacters());
  results.push(await testLongInput());

  // 汇总
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║            Test Summary               ║');
  console.log('╚════════════════════════════════════════╝');

  const passed = results.filter(r => r).length;
  const failed = results.length - passed;

  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n❌ Some tests failed. Please check the output above.');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
}

runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});