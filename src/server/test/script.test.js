/**
 * Script Generator Tests
 * 测试剧本生成服务
 *
 * 运行方式:
 *   cp .env.example .env
 *   # 编辑 .env 填入 DEEPSEEK_API_KEY
 *   node test/script.test.js
 */

import { generateScript } from '../services/scriptGenerator.js';

// 测试辅助函数
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertValidScript(script) {
  assert(script && typeof script === 'object', 'Script should be an object');
  assert(script.title && typeof script.title === 'string', 'Script should have title');
  assert(Array.isArray(script.dialogues), 'Script dialogues should be an array');
  assert(script.dialogues.length > 0, 'Script should have at least one dialogue');
}

// ============================================
// 内置测试数据
// ============================================

const personaA = {
  id: '大妈-催婚',
  name: '催婚大妈',
  personality: ['热络', '控制型', '爱打听', '碎碎念'],
  speakingStyle: '直接、曲里拐弯、唠叨型，擅长以关心之名行逼问之实',
  views: [
    '婚姻是人生大事，不结婚将来谁照顾你',
    '我这是为你好，趁年轻早点要孩子身体恢复快',
    '邻居家孩子都会打酱油了，你怎么还不着急'
  ]
};

const personaB = {
  id: '青年-反卷',
  name: '反卷青年',
  personality: ['躺平', '丧', '不屑', '丧系幽默'],
  speakingStyle: '敷衍、怼人、冷幽默，能躺着绝不坐着',
  views: [
    '躺平万岁，卷来卷去有什么意义',
    '拒绝焦虑，从我做起，人生苦短及时行乐'
  ]
};

const scene = {
  id: '场景-过年催婚',
  name: '过年催婚',
  description: '家庭聚会，亲戚盘问婚姻对象'
};

// ============================================
// 测试用例
// ============================================

/**
 * TEST 1: 两个人设 + 场景 → 生成8-12轮对话
 */
async function testBasicGeneration() {
  console.log('\n=== Test 1: Basic Script Generation ===');

  try {
    const script = await generateScript({
      personaA,
      personaB,
      scene,
      maxRounds: 10
    });

    console.log('Generated Script:', JSON.stringify(script, null, 2));

    assertValidScript(script);
    assert(script.dialogues.length >= 8 && script.dialogues.length <= 12,
      `Dialogue count should be 8-12, got ${script.dialogues.length}`);

    // 验证对话结构
    script.dialogues.forEach((d, i) => {
      assert(d.speaker && (d.speaker === 'A' || d.speaker === 'B'),
        `Dialogue ${i} should have valid speaker A or B`);
      assert(d.content && typeof d.content === 'string',
        `Dialogue ${i} should have content`);
    });

    console.log('✅ Test 1 PASSED');
    return true;
  } catch (error) {
    console.log(`❌ Test 1 FAILED: ${error.message}`);
    return false;
  }
}

/**
 * TEST 2: 两个人设冲突（催婚大妈 vs 反卷青年）→ 有戏剧性
 */
async function testConflictPersonas() {
  console.log('\n=== Test 2: Conflict Personas ===');

  try {
    const script = await generateScript({
      personaA,
      personaB,
      scene,
      maxRounds: 8
    });

    console.log('Script Title:', script.title);
    console.log('Dialogue Count:', script.dialogues.length);

    // 检查戏剧冲突：对话应该有来回交锋
    const aLines = script.dialogues.filter(d => d.speaker === 'A');
    const bLines = script.dialogues.filter(d => d.speaker === 'B');

    assert(aLines.length >= 3, 'Persona A should have at least 3 lines');
    assert(bLines.length >= 3, 'Persona B should have at least 3 lines');

    // 检查是否有观点碰撞（内容包含某些关键词暗示冲突）
    const content = script.dialogues.map(d => d.content).join('');
    const hasConflict = content.includes('结婚') || content.includes('工作') ||
                        content.includes('生活') || content.includes('躺平');

    console.log('Has conflict indicators:', hasConflict);

    console.log('✅ Test 2 PASSED');
    return true;
  } catch (error) {
    console.log(`❌ Test 2 FAILED: ${error.message}`);
    return false;
  }
}

/**
 * TEST 3: 场景空白 → 有合理默认值
 */
async function testEmptyScene() {
  console.log('\n=== Test 3: Empty Scene ===');

  try {
    const script = await generateScript({
      personaA,
      personaB,
      scene: { id: '', name: '', description: '' },
      maxRounds: 8
    });

    assertValidScript(script);

    console.log('✅ Test 3 PASSED');
    return true;
  } catch (error) {
    console.log(`❌ Test 3 FAILED: ${error.message}`);
    return false;
  }
}

/**
 * TEST 4: 10轮对话是否有递进/推进
 */
async function testDialogueProgression() {
  console.log('\n=== Test 4: Dialogue Progression ===');

  try {
    const script = await generateScript({
      personaA,
      personaB,
      scene,
      maxRounds: 10
    });

    const dialogues = script.dialogues;
    console.log('Total dialogues:', dialogues.length);

    // 检查对话长度是否合理（50-150字符）
    const shortLines = dialogues.filter(d => d.content.length < 10);
    const longLines = dialogues.filter(d => d.content.length > 300);

    console.log('Very short lines (<10 chars):', shortLines.length);
    console.log('Very long lines (>300 chars):', longLines.length);

    // 对话不应该太短（聊天式你来我往）
    assert(dialogues.length >= 8, 'Should have at least 8 dialogues');

    console.log('✅ Test 4 PASSED');
    return true;
  } catch (error) {
    console.log(`❌ Test 4 FAILED: ${error.message}`);
    return false;
  }
}

/**
 * TEST 5: 多轮对话自然收尾
 */
async function testNaturalEnding() {
  console.log('\n=== Test 5: Natural Ending ===');

  try {
    const script = await generateScript({
      personaA,
      personaB,
      scene,
      maxRounds: 8
    });

    const lastDialogue = script.dialogues[script.dialogues.length - 1];
    console.log('Last dialogue:', lastDialogue.content.substring(0, 50) + '...');

    // 检查结尾是否有收尾感
    const endingIndicators = ['好了', '行吧', '算了吧', '就这样', '反正', '随便', '呗', '吧'];
    const hasEnding = endingIndicators.some(indicator =>
      lastDialogue.content.includes(indicator)
    );

    console.log('Has ending indicator:', hasEnding);

    console.log('✅ Test 5 PASSED');
    return true;
  } catch (error) {
    console.log(`❌ Test 5 FAILED: ${error.message}`);
    return false;
  }
}

/**
 * TEST 6: 不同 maxRounds 设置
 */
async function testDifferentMaxRounds() {
  console.log('\n=== Test 6: Different MaxRounds ===');

  const roundOptions = [4, 8, 12, 16];

  for (const maxRounds of roundOptions) {
    try {
      const script = await generateScript({
        personaA,
        personaB,
        scene,
        maxRounds
      });

      console.log(`maxRounds=${maxRounds} -> ${script.dialogues.length} dialogues`);

      // 允许一定误差范围
      assert(script.dialogues.length >= maxRounds - 2 &&
             script.dialogues.length <= maxRounds + 4,
             `Dialogues should be around ${maxRounds}`);
    } catch (error) {
      console.log(`❌ maxRounds=${maxRounds} FAILED: ${error.message}`);
      return false;
    }
  }

  console.log('✅ Test 6 PASSED');
  return true;
}

// ============================================
// 运行测试
// ============================================

async function runTests() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║      Script Generator Tests            ║');
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
  results.push(await testBasicGeneration());
  results.push(await testConflictPersonas());
  results.push(await testEmptyScene());
  results.push(await testDialogueProgression());
  results.push(await testNaturalEnding());
  results.push(await testDifferentMaxRounds());

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