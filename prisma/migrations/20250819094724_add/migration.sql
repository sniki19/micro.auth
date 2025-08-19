CREATE OR REPLACE FUNCTION check_email_or_phone()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS NULL AND NEW.phone IS NULL THEN
    RAISE EXCEPTION 'Either email or phone must be provided';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_auth_credentials_check
BEFORE INSERT OR UPDATE ON user_auth_credentials
FOR EACH ROW EXECUTE FUNCTION check_email_or_phone();
