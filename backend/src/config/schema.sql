-- =============================================
-- DATABASE SCHEMA FOR YOHAN'S ACADEMIC DASHBOARD
-- SQLite Version
-- =============================================

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'student', 'viewer')),
    avatar_url TEXT,
    is_active INTEGER DEFAULT 1,
    last_login TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- SUBJECTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS subjects (
    subject_id TEXT PRIMARY KEY,
    subject_name TEXT NOT NULL,
    subject_code TEXT,
    subject_type TEXT NOT NULL CHECK (subject_type IN ('Core', 'Elective')),
    exam_board TEXT CHECK (exam_board IN ('Cambridge', 'Edexcel', 'Other')),
    target_grade TEXT CHECK (target_grade IN ('A*', 'A', 'B', 'C', 'D', 'E', 'F', 'G')),
    predicted_grade TEXT CHECK (predicted_grade IN ('A*', 'A', 'B', 'C', 'D', 'E', 'F', 'G')),
    color_code TEXT,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_by TEXT REFERENCES users(user_id),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- FACILITATORS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS facilitators (
    facilitator_id TEXT PRIMARY KEY,
    facilitator_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    office_hours TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for facilitators and subjects
CREATE TABLE IF NOT EXISTS facilitator_subjects (
    facilitator_id TEXT REFERENCES facilitators(facilitator_id) ON DELETE CASCADE,
    subject_id TEXT REFERENCES subjects(subject_id) ON DELETE CASCADE,
    PRIMARY KEY (facilitator_id, subject_id)
);

-- =============================================
-- BOOKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS books (
    book_id TEXT PRIMARY KEY,
    subject_id TEXT REFERENCES subjects(subject_id) ON DELETE CASCADE,
    book_title TEXT NOT NULL,
    author TEXT,
    publisher TEXT,
    isbn TEXT,
    edition TEXT,
    publication_year INTEGER,
    book_type TEXT CHECK (book_type IN ('Textbook', 'Workbook', 'Guide', 'Reference')),
    purchase_status TEXT NOT NULL CHECK (purchase_status IN ('Owned', 'Borrowed', 'Digital', 'To_Purchase')),
    cost REAL,
    purchase_date TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TOPICS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS topics (
    topic_id TEXT PRIMARY KEY,
    subject_id TEXT REFERENCES subjects(subject_id) ON DELETE CASCADE,
    book_id TEXT REFERENCES books(book_id) ON DELETE SET NULL,
    chapter_number INTEGER,
    chapter_name TEXT,
    topic_name TEXT NOT NULL,
    topic_order INTEGER,
    weightage_percentage REAL,
    difficulty_level TEXT CHECK (difficulty_level IN ('Easy', 'Medium', 'Hard')),
    completion_status TEXT NOT NULL DEFAULT 'Not_Started' 
        CHECK (completion_status IN ('Not_Started', 'In_Progress', 'Completed', 'Needs_Revision')),
    date_covered TEXT,
    class_notes_url TEXT,
    resource_urls TEXT, -- JSON array
    personal_notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ASSIGNMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS assignments (
    assignment_id TEXT PRIMARY KEY,
    subject_id TEXT REFERENCES subjects(subject_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assignment_type TEXT NOT NULL 
        CHECK (assignment_type IN ('Homework', 'Project', 'Coursework', 'Practical', 'Essay', 'Presentation', 'Lab_Report', 'Other')),
    assigned_date TEXT,
    due_date TEXT NOT NULL,
    due_time TEXT,
    status TEXT NOT NULL DEFAULT 'Not_Started'
        CHECK (status IN ('Not_Started', 'In_Progress', 'Submitted', 'Graded', 'Returned')),
    priority TEXT CHECK (priority IN ('High', 'Medium', 'Low')),
    max_marks REAL,
    marks_obtained REAL,
    weightage_percentage REAL,
    feedback TEXT,
    time_spent_hours REAL,
    submission_date TEXT,
    attachment_urls TEXT, -- JSON array
    personal_notes TEXT,
    reminder_days INTEGER,
    created_by TEXT REFERENCES users(user_id),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for assignments and topics
CREATE TABLE IF NOT EXISTS assignment_topics (
    assignment_id TEXT REFERENCES assignments(assignment_id) ON DELETE CASCADE,
    topic_id TEXT REFERENCES topics(topic_id) ON DELETE CASCADE,
    PRIMARY KEY (assignment_id, topic_id)
);

-- =============================================
-- TESTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS tests (
    test_id TEXT PRIMARY KEY,
    subject_id TEXT REFERENCES subjects(subject_id) ON DELETE CASCADE,
    test_name TEXT NOT NULL,
    test_type TEXT NOT NULL 
        CHECK (test_type IN ('Unit_Test', 'Mid_Term', 'Final', 'Mock_Exam', 'Class_Quiz', 'Practical', 'Oral', 'Other')),
    test_date TEXT NOT NULL,
    academic_term TEXT CHECK (academic_term IN ('Term_1', 'Term_2', 'Term_3', 'Annual')),
    max_marks REAL NOT NULL,
    marks_obtained REAL,
    percentage REAL,
    grade TEXT,
    class_average REAL,
    class_highest REAL,
    rank INTEGER,
    total_students INTEGER,
    what_went_well TEXT,
    areas_to_improve TEXT,
    action_items TEXT,
    retest_available INTEGER DEFAULT 0,
    retest_date TEXT,
    retest_marks REAL,
    question_paper_url TEXT,
    answer_sheet_url TEXT,
    personal_notes TEXT,
    created_by TEXT REFERENCES users(user_id),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for tests and topics
CREATE TABLE IF NOT EXISTS test_topics (
    test_id TEXT REFERENCES tests(test_id) ON DELETE CASCADE,
    topic_id TEXT REFERENCES topics(topic_id) ON DELETE CASCADE,
    PRIMARY KEY (test_id, topic_id)
);

-- =============================================
-- ATTENDANCE TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS attendance (
    attendance_id TEXT PRIMARY KEY,
    date TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL 
        CHECK (status IN ('Present', 'Absent', 'Late', 'Half_Day', 'Holiday', 'School_Closed', 'School_Event')),
    absence_category TEXT 
        CHECK (absence_category IN ('Illness', 'Medical_Appointment', 'Family_Emergency', 'Family_Event', 'School_Activity', 'Other')),
    reason TEXT,
    medical_certificate_url TEXT,
    late_duration_minutes INTEGER,
    half_day_type TEXT CHECK (half_day_type IN ('Morning', 'Afternoon')),
    makeup_work_required TEXT,
    makeup_work_completed INTEGER DEFAULT 0,
    personal_notes TEXT,
    created_by TEXT REFERENCES users(user_id),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- FEES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS fees (
    fee_id TEXT PRIMARY KEY,
    fee_category TEXT NOT NULL 
        CHECK (fee_category IN ('Tuition', 'Exam_Fees', 'Lab_Fees', 'Library', 'Transport', 'Trip', 'Activity', 'Books', 'Uniform', 'Technology', 'Other')),
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    due_date TEXT,
    academic_term TEXT CHECK (academic_term IN ('Term_1', 'Term_2', 'Term_3', 'Annual', 'One_Time')),
    payment_status TEXT NOT NULL DEFAULT 'Pending'
        CHECK (payment_status IN ('Pending', 'Paid', 'Overdue', 'Partial')),
    amount_paid REAL,
    payment_date TEXT,
    paid_by TEXT,
    payment_mode TEXT 
        CHECK (payment_mode IN ('Cash', 'Bank_Transfer', 'UPI', 'Credit_Card', 'Debit_Card', 'Cheque', 'Online_Portal')),
    transaction_reference TEXT,
    receipt_number TEXT,
    receipt_url TEXT,
    is_recurring INTEGER DEFAULT 0,
    personal_notes TEXT,
    created_by TEXT REFERENCES users(user_id),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- EVENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS events (
    event_id TEXT PRIMARY KEY,
    event_name TEXT NOT NULL,
    event_type TEXT NOT NULL 
        CHECK (event_type IN ('Academic', 'Cultural', 'Sports', 'Community_Service', 'Competition', 'Workshop', 'Assembly', 'Other')),
    start_date TEXT NOT NULL,
    end_date TEXT,
    location TEXT,
    organizer TEXT,
    description TEXT,
    participation_level TEXT 
        CHECK (participation_level IN ('Participant', 'Volunteer', 'Organizer', 'Leader', 'Team_Captain', 'Performer', 'Audience', 'Not_Participated')),
    role_description TEXT,
    impact_description TEXT,
    team_size INTEGER,
    skills_demonstrated TEXT, -- JSON array
    recognition_received TEXT,
    evidence_urls TEXT, -- JSON array
    reflection TEXT,
    include_in_portfolio INTEGER DEFAULT 0,
    personal_notes TEXT,
    created_by TEXT REFERENCES users(user_id),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- AWARDS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS awards (
    award_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    award_category TEXT NOT NULL 
        CHECK (award_category IN ('Academic', 'Sports', 'Arts', 'Music', 'Drama', 'Leadership', 'Community_Service', 'STEM', 'Languages', 'Other')),
    award_level TEXT NOT NULL 
        CHECK (award_level IN ('Class', 'School', 'Inter_School', 'District', 'State', 'National', 'International')),
    issuing_authority TEXT NOT NULL,
    date_received TEXT NOT NULL,
    description TEXT,
    achievement_details TEXT,
    linked_event_id TEXT REFERENCES events(event_id) ON DELETE SET NULL,
    certificate_url TEXT,
    evidence_urls TEXT, -- JSON array
    appreciations TEXT,
    witnesses TEXT,
    include_in_portfolio INTEGER DEFAULT 1,
    personal_notes TEXT,
    created_by TEXT REFERENCES users(user_id),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ACTIVITIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS activities (
    activity_id TEXT PRIMARY KEY,
    activity_name TEXT NOT NULL,
    activity_type TEXT NOT NULL 
        CHECK (activity_type IN ('Educational_Trip', 'Adventure_Camp', 'Volunteering', 'Competition', 'Workshop', 'Course', 'Internship', 'Sports_Camp', 'Music_Lessons', 'Other')),
    organizer TEXT,
    organizer_type TEXT CHECK (organizer_type IN ('School', 'External_Organization', 'Self_Initiated', 'Family')),
    start_date TEXT NOT NULL,
    end_date TEXT,
    duration_hours REAL,
    location TEXT,
    description TEXT,
    objectives TEXT,
    skills_developed TEXT, -- JSON array
    outcome TEXT,
    certificate_url TEXT,
    evidence_urls TEXT, -- JSON array
    supervisor_name TEXT,
    supervisor_contact TEXT,
    cost REAL,
    reflection TEXT,
    include_in_portfolio INTEGER DEFAULT 0,
    personal_notes TEXT,
    created_by TEXT REFERENCES users(user_id),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- NOTES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS notes (
    note_id TEXT PRIMARY KEY,
    linked_module TEXT 
        CHECK (linked_module IN ('Subject', 'Assignment', 'Test', 'Event', 'Award', 'Activity', 'Fee', 'Attendance', 'General')),
    linked_entity_id TEXT,
    note_type TEXT NOT NULL 
        CHECK (note_type IN ('Observation', 'Concern', 'Achievement', 'Follow_Up', 'Reminder', 'General')),
    title TEXT,
    content TEXT NOT NULL,
    visibility TEXT NOT NULL DEFAULT 'All_Users'
        CHECK (visibility IN ('All_Users', 'Private')),
    follow_up_date TEXT,
    follow_up_status TEXT CHECK (follow_up_status IN ('Pending', 'In_Progress', 'Completed')),
    created_by TEXT REFERENCES users(user_id),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- COMMUNICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS communications (
    communication_id TEXT PRIMARY KEY,
    communication_type TEXT NOT NULL 
        CHECK (communication_type IN ('PTM', 'Email', 'Phone_Call', 'Message', 'School_Notice', 'Report_Card')),
    date TEXT NOT NULL,
    participants TEXT NOT NULL,
    subject TEXT NOT NULL,
    summary TEXT NOT NULL,
    key_points TEXT,
    action_items TEXT,
    attachment_urls TEXT, -- JSON array
    follow_up_required INTEGER DEFAULT 0,
    follow_up_date TEXT,
    follow_up_status TEXT CHECK (follow_up_status IN ('Pending', 'Completed')),
    personal_notes TEXT,
    created_by TEXT REFERENCES users(user_id),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ACTIVITY LOG TABLE (for tracking changes)
-- =============================================
CREATE TABLE IF NOT EXISTS activity_log (
    log_id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(user_id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    entity_name TEXT,
    details TEXT, -- JSON
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_subjects_active ON subjects(is_active);
CREATE INDEX IF NOT EXISTS idx_topics_subject ON topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_topics_status ON topics(completion_status);
CREATE INDEX IF NOT EXISTS idx_assignments_subject ON assignments(subject_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_tests_subject ON tests(subject_id);
CREATE INDEX IF NOT EXISTS idx_tests_date ON tests(test_date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_fees_status ON fees(payment_status);
CREATE INDEX IF NOT EXISTS idx_fees_due_date ON fees(due_date);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_awards_date ON awards(date_received);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(start_date);
CREATE INDEX IF NOT EXISTS idx_notes_linked ON notes(linked_module, linked_entity_id);
CREATE INDEX IF NOT EXISTS idx_communications_date ON communications(date);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
