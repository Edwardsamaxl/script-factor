import 'dotenv/config';
import app from './app.js';
import { resumePendingTasks } from './services/aigcService.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Script Factor API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  // 恢复因服务重启而卡住的 pending 生成任务
  resumePendingTasks();
});
