import os
import time
import json
from pathlib import Path
# Install SDK:  pip install 'volcengine-python-sdk[ark]'
from volcenginesdkarkruntime import Ark

def load_script_from_file(file_path):
    """
    从本地文件加载剧本内容
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()

def build_video_prompt(script_content):
    """
    将剧本转换为视频生成提示词
    """
    return f"根据以下剧本生成一段连贯的视频，保持角色一致，场景真实，对话自然，情感表达清晰：\n\n{script_content}"

def extract_video_info(result):
    """
    从任务结果中提取视频信息
    """
    video_url = None
    video_info = {}
    
    # 尝试从 output 字段提取
    if hasattr(result, 'output') and result.output:
        print(f"output 字段存在，共 {len(result.output)} 个输出项")
        for idx, item in enumerate(result.output):
            print(f"  输出项 {idx}: type={type(item)}")
            if hasattr(item, 'url'):
                video_url = item.url
                video_info['url'] = item.url
                print(f"    找到 URL: {item.url}")
            if hasattr(item, 'video_url'):
                video_url = item.video_url
                video_info['video_url'] = item.video_url
                print(f"    找到 video_url: {item.video_url}")
            if hasattr(item, 'text'):
                video_info['text'] = item.text
            if hasattr(item, 'duration'):
                video_info['duration'] = item.duration
            if hasattr(item, 'resolution'):
                video_info['resolution'] = item.resolution
            if hasattr(item, 'ratio'):
                video_info['ratio'] = item.ratio
    else:
        print("未找到 output 字段")
    
    # 尝试直接从 result 提取
    if not video_url and hasattr(result, 'video_url'):
        video_url = result.video_url
        video_info['video_url'] = result.video_url
        print(f"直接从 result 找到 video_url: {result.video_url}")
    
    return video_url, video_info

def save_result_to_file(result, output_path="api-demo/video_result.json"):
    """
    将完整的任务结果保存到文件
    """
    try:
        # 使用 model_dump 转换为字典
        if hasattr(result, 'model_dump'):
            result_dict = result.model_dump()
        elif hasattr(result, 'dict'):
            result_dict = result.dict()
        else:
            result_dict = {"raw": str(result)}
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(result_dict, f, ensure_ascii=False, indent=2)
        
        print(f"完整结果已保存到: {output_path}")
    except Exception as e:
        print(f"保存结果失败: {e}")

def main():
    # 初始化 Ark 客户端
    client = Ark(
        base_url="https://ark.cn-beijing.volces.com/api/v3",
        api_key=os.environ.get("ARK_API_KEY"),
    )
    
    # 从文件加载剧本
    script_file = "api-demo/script.txt"
    script_content = load_script_from_file(script_file)
    
    # 构建视频生成提示词
    video_prompt = build_video_prompt(script_content)
    
    print("=== 剧本转视频工具 ===")
    print("正在创建视频生成任务...")
    
    # 创建视频生成任务
    create_result = client.content_generation.tasks.create(
        model="doubao-seedance-1-5-pro-251215",  # 使用 Doubao-Seedance-1.5-pro 模型
        content=[
            {
                "type": "text",
                "text": video_prompt
            }
        ],
        resolution="720p",  # 视频分辨率
        ratio="16:9",        # 视频比例
        duration=10,          # 视频时长（秒）
        generate_audio=True,   # 生成音频
        watermark=False,       # 不添加水印
    )
    
    print(f"任务创建成功，任务ID: {create_result.id}")
    
    # 轮询任务状态
    print("\n正在轮询任务状态...")
    task_id = create_result.id
    
    while True:
        get_result = client.content_generation.tasks.get(task_id=task_id)
        status = get_result.status
        
        print(f"当前状态: {status}")
        
        if status == "succeeded":
            print("\n=== 任务成功完成 ===")
            
            # 提取并显示视频信息
            video_url, video_info = extract_video_info(get_result)
            
            # 保存完整结果到文件
            save_result_to_file(get_result, "api-demo/video_result.json")
            
            # 显示视频 URL
            if video_url:
                print(f"\n🎬 视频URL: {video_url}")
                print(f"💡 您可以直接点击链接查看或下载视频")
            else:
                print("\n⚠️ 未能自动提取视频URL，请查看保存的JSON文件获取详细信息")
            
            # 显示其他视频信息
            if video_info:
                print("\n📊 视频信息:")
                for key, value in video_info.items():
                    if key not in ['url', 'video_url', 'text']:
                        print(f"  {key}: {value}")
            
            break
        elif status == "failed":
            print("\n=== 任务失败 ===")
            if hasattr(get_result, 'error'):
                print(f"错误: {get_result.error}")
            break
        else:
            print("等待中...")
            time.sleep(5)

if __name__ == "__main__":
    if not os.environ.get("ARK_API_KEY"):
        print("请设置 ARK_API_KEY 环境变量")
        exit(1)
    main()