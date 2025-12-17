CREATE TABLE IF NOT EXISTS task (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS account (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Siemennä task-taulu vain jos tyhjä
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM task) THEN
    INSERT INTO task (description) VALUES
      ('Complete the project documentation'),
      ('Review the code changes'),
      ('Prepare for the team meeting'),
      ('Update the project timeline'),
      ('Test the new features'),
      ('Fix the reported bugs'),
      ('Deploy the application to production'),
      ('Conduct a code review with peers');
  END IF;
END $$;

-- Esimerkkikäyttäjä vain, jos email vielä puuttuu
DO $$
DECLARE
  existing INTEGER;
BEGIN
  SELECT id INTO existing FROM account WHERE email = 'demo@example.com';
  IF existing IS NULL THEN
    -- Salasana 'password' bcrypt-hashattuna (cost 10)
    INSERT INTO account (email, password_hash)
    VALUES ('demo@example.com', '$2b$10$rYeBrK034rgclW71F43m9uZi1MIxmFD6rU7QCELqbiw7ZFn3.2rmK');
  END IF;
END $$;