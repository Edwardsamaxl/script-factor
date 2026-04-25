/**
 * Dual LLM Communication Tests
 * 测试双 LLM 之间的通信能力
 *
 * 运行方式:
 *   cd src/server
 *   node test/dual-llm.test.js
 */

import {
  callDeepSeekA,
  callDeepSeekB,
  callDeepSeekAWithSystem,
  callDeepSeekBWithSystem
} from '../services/llm.js';

// 测试辅助函数
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// ============================================
// 测试用例
// ============================================

/**
 * TEST 1: LLM A 单独调用
 */
async function testLLMAOnly() {
  console.log('\n=== Test 1: LLM A Only ===');

  try {
    const response = await callDeepSeekAWithSystem(
      'You are a helpful assistant. Respond with exactly one short sentence.',
      'Say hello in Chinese'
    );

    console.log('LLM A Response:', response);

    assert(response && typeof response === 'string', 'Should return a string');
    assert(response.length > 0, 'Response should not be empty');

    console.log('✅ Test 1 PASSED');
    return true;
  } catch (error) {
    console.log(`❌ Test 1 FAILED: ${error.message}`);
    return false;
  }
}

/**
 * TEST 2: LLM B 单独调用
 */
async function testLLMBOnly() {
  console.log('\n=== Test 2: LLM B Only ===');

  try {
    const response = await callDeepSeekBWithSystem(
      'You are a helpful assistant. Respond with exactly one short sentence.',
      'Say hello in Chinese'
    );

    console.log('LLM B Response:', response);

    assert(response && typeof response === 'string', 'Should return a string');
    assert(response.length > 0, 'Response should not be empty');

    console.log('✅ Test 2 PASSED');
    return true;
  } catch (error) {
    console.log(`❌ Test 2 FAILED: ${error.message}`);
    return false;
  }
}

/**
 * TEST 3: 双 LLM 简单对话（A → B）
 */
async function testSimpleDialogue() {
  console.log('\n=== Test 3: Simple A → B Dialogue ===');

  try {
    // LLM A 发消息
    const llmAResponse = await callDeepSeekAWithSystem(
      `You are a cynical, laid-back young person who believes in "lying flat" (躺平).
Your personality: laid-back, sarcastic, humorously defeated.
Speak in character and keep responses short (under 50 characters).`,
      'What do you think about working overtime?'
    );

    console.log('LLM A (躺平青年):', llmAResponse);

    // LLM B 回应
    const llmBResponse = await callDeepSeekBWithSystem(
      `You are a pushy matchmaking aunt (催婚大妈) who cares about others' life decisions.
Your personality:热络, controlling, nosy,唠叨.
Speak in character and keep responses short (under 50 characters).`,
      llmAResponse
    );

    console.log('LLM B (催婚大妈):', llmBResponse);

    assert(llmAResponse && typeof llmAResponse === 'string', 'LLM A should respond');
    assert(llmBResponse && typeof llmBResponse === 'string', 'LLM B should respond');
    assert(llmAResponse.length > 0, 'LLM A response should not be empty');
    assert(llmBResponse.length > 0, 'LLM B response should not be empty');

    console.log('✅ Test 3 PASSED');
    return true;
  } catch (error) {
    console.log(`❌ Test 3 FAILED: ${error.message}`);
    return false;
  }
}

/**
 * TEST 4: 多轮对话模拟（角色扮演）
 */
async function testMultiTurnDialogue() {
  console.log('\n=== Test 4: Multi-Turn Dialogue (催婚大妈 vs 躺平青年) ===');

  const personaA = {
    name: '催婚大妈',
    personality: '热络、控制型、唠叨，擅长以关心之名行逼问之实',
    speakingStyle: '直接、曲里拐弯、唠叨型',
    views: ['婚姻是人生大事', '趁年轻早点要孩子']
  };

  const personaB = {
    name: '躺平青年',
    personality: '躺平、丧、丧系幽默',
    speakingStyle: '敷衍、怼人、冷幽默',
    views: ['躺平万岁', '拒绝焦虑']
  };

  const scene = {
    name: '过年催婚',
    description: '家庭聚会，亲戚盘问婚姻对象'
  };

  const dialogues = [];

  try {
    // Round 1: A → B (催婚大妈先开口)
    console.log('\n--- Round 1: A → B ---');
    const round1 = await callDeepSeekAWithSystem(
      `You are roleplaying as ${personaA.name}.
Personality: ${personaA.personality}
Speaking style: ${personaA.speakingStyle}
Scene: ${scene.name} - ${scene.description}

Generate a short dialogue line (under 50 characters) that ${personaA.name} would say to start a conversation about marriage pressure.`,
      'Start a conversation about marriage'
    );
    console.log(`${personaA.name}:`, round1);
    dialogues.push({ speaker: 'A', content: round1 });

    // Round 2: B → A (躺平青年回应)
    console.log('\n--- Round 2: B → A ---');
    const round2 = await callDeepSeekBWithSystem(
      `You are roleplaying as ${personaB.name}.
Personality: ${personaB.personality}
Speaking style: ${personaB.speakingStyle}
Scene: ${scene.name} - ${scene.description}

Previous dialogue:
A: ${round1}

Generate a short response (under 50 characters) that ${personaB.name} would say in reply.`,
      'Respond to the marriage pressure'
    );
    console.log(`${personaB.name}:`, round2);
    dialogues.push({ speaker: 'B', content: round2 });

    // Round 3: A → B (催婚大妈追问)
    console.log('\n--- Round 3: A → B ---');
    const round3 = await callDeepSeekAWithSystem(
      `You are roleplaying as ${personaA.name}.
Personality: ${personaA.personality}
Speaking style: ${personaA.speakingStyle}

Previous dialogue:
A: ${round1}
B: ${round2}

Generate a short follow-up (under 50 characters) that ${personaA.name} would say, continuing to push the marriage topic.`,
      'Continue pushing the marriage topic'
    );
    console.log(`${personaA.name}:`, round3);
    dialogues.push({ speaker: 'A', content: round3 });

    // Round 4: B → A (躺平青年反击)
    console.log('\n--- Round 4: B → A ---');
    const round4 = await callDeepSeekBWithSystem(
      `You are roleplaying as ${personaB.name}.
Personality: ${personaB.personality}
Speaking style: ${personaB.speakingStyle}

Previous dialogue:
A: ${round1}
B: ${round2}
A: ${round3}

Generate a short witty comeback (under 50 characters) that ${personaB.name} would say to deflect the marriage pressure.`,
      'Deflect the marriage pressure with humor'
    );
    console.log(`${personaB.name}:`, round4);
    dialogues.push({ speaker: 'B', content: round4 });

    console.log('\n--- Full Dialogue ---');
    dialogues.forEach((d, i) => {
      const speakerName = d.speaker === 'A' ? personaA.name : personaB.name;
      console.log(`${i + 1}. [${speakerName}]: ${d.content}`);
    });

    assert(dialogues.length === 4, 'Should have 4 dialogue lines');
    dialogues.forEach((d, i) => {
      assert(d.content.length > 0, `Dialogue ${i + 1} should not be empty`);
    });

    console.log('✅ Test 4 PASSED');
    return true;
  } catch (error) {
    console.log(`❌ Test 4 FAILED: ${error.message}`);
    return false;
  }
}

/**
 * TEST 5: 双 LLM 通信延迟测试
 */
async function testLatency() {
  console.log('\n=== Test 5: LLM Latency ===');

  const iterations = 3;
  const latenciesA = [];
  const latenciesB = [];

  try {
    for (let i = 0; i < iterations; i++) {
      // Test LLM A latency
      const startA = Date.now();
      await callDeepSeekAWithSystem(
        'Respond with exactly one word.',
        'Hello'
      );
      latenciesA.push(Date.now() - startA);

      // Test LLM B latency
      const startB = Date.now();
      await callDeepSeekBWithSystem(
        'Respond with exactly one word.',
        'Hello'
      );
      latenciesB.push(Date.now() - startB);
    }

    const avgLatencyA = latenciesA.reduce((a, b) => a + b, 0) / latenciesA.length;
    const avgLatencyB = latenciesB.reduce((a, b) => a + b, 0) / latenciesB.length;

    console.log(`LLM A - Avg latency: ${avgLatencyA.toFixed(0)}ms (${latenciesA.map(t => t + 'ms').join(', ')})`);
    console.log(`LLM B - Avg latency: ${avgLatencyB.toFixed(0)}ms (${latenciesB.map(t => t + 'ms').join(', ')})`);

    assert(avgLatencyA < 10000, 'LLM A should respond within 10 seconds');
    assert(avgLatencyB < 10000, 'LLM B should respond within 10 seconds');

    console.log('✅ Test 5 PASSED');
    return true;
  } catch (error) {
    console.log(`❌ Test 5 FAILED: ${error.message}`);
    return false;
  }
}

// ============================================
// 运行测试
// ============================================

async function runTests() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║      Dual LLM Communication Tests     ║');
  console.log('╚════════════════════════════════════════╝');

  // 检查 API Key
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.log('\n⚠️  WARNING: DEEPSEEK_API_KEY not set in .env');
    console.log('   Tests requiring LLM calls will fail.');
    console.log('   Please add DEEPSEEK_API_KEY to your .env file.\n');
    process.exit(1);
  }

  console.log(`\n✅ API Key found: ${apiKey.substring(0, 10)}...`);

  const results = [];

  // 运行所有测试
  results.push(await testLLMAOnly());
  results.push(await testLLMBOnly());
  results.push(await testSimpleDialogue());
  results.push(await testMultiTurnDialogue());
  results.push(await testLatency());

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
    console.log('\n✅ All tests passed! Dual LLM communication is working.');
    process.exit(0);
  }
}

runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
