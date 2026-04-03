-- 分类表
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📁',
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 脚本表
CREATE TABLE IF NOT EXISTS scripts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  script_type TEXT NOT NULL DEFAULT 'file',
  file_path TEXT,
  content TEXT,
  shell TEXT DEFAULT '/bin/bash',
  working_dir TEXT,
  category_id INTEGER REFERENCES categories(id),
  tags TEXT DEFAULT '[]',
  params_schema TEXT DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 参数预设表
CREATE TABLE IF NOT EXISTS param_presets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  script_id INTEGER NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  params TEXT NOT NULL DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 执行历史表
CREATE TABLE IF NOT EXISTS execution_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  script_id INTEGER NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  params TEXT DEFAULT '{}',
  exit_code INTEGER,
  output_summary TEXT,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  finished_at DATETIME,
  duration_ms INTEGER
);

-- 默认分类
INSERT OR IGNORE INTO categories (id, name, icon, sort_order) VALUES
  (1, '全部', '📋', 0),
  (2, '部署', '🚀', 1),
  (3, '构建', '🔨', 2),
  (4, '清理', '🧹', 3),
  (5, '工具', '🔧', 4);
