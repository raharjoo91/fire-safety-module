-- Fire Safety Gamified Module - Supabase Schema
-- Free tier: 500MB DB, 5GB bandwidth, 50K users - plenty for ~30 students

-- Students / profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT DEFAULT '/assets/characters/default-avatar.png',
  class_group TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Lesson progress
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  score INTEGER DEFAULT 0,
  safety_delta INTEGER DEFAULT 0,
  choices_data JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own progress"
  ON lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON lesson_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Badges earned
CREATE TABLE badges_earned (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE badges_earned ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own badges"
  ON badges_earned FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON badges_earned FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- xAPI statements log
CREATE TABLE xapi_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  statement JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE xapi_statements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own statements"
  ON xapi_statements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own statements"
  ON xapi_statements FOR SELECT
  USING (auth.uid() = user_id);

-- Admin can read all (for teacher dashboard)
CREATE POLICY "Admin read all progress"
  ON lesson_progress FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin read all badges"
  ON badges_earned FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin read all statements"
  ON xapi_statements FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Indexes
CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_badges_earned_user ON badges_earned(user_id);
CREATE INDEX idx_xapi_user ON xapi_statements(user_id);
CREATE INDEX idx_xapi_created ON xapi_statements(created_at DESC);

-- Function to sync profile on user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'display_name', 'Student'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
