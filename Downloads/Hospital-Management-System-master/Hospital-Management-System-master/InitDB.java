import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class InitDB {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/";
        String user = "root";
        String password = "ksrct";

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            try (Connection conn = DriverManager.getConnection(url, user, password);
                 Statement stmt = conn.createStatement()) {

                System.out.println("Connected to MySQL instance...");

                // Create Database
                stmt.executeUpdate("CREATE DATABASE IF NOT EXISTS hospital;");
                System.out.println("Database 'hospital' created or already exists.");

                // Use Database
                stmt.execute("USE hospital;");

                // Create patients table
                String createPatients = "CREATE TABLE IF NOT EXISTS patients (" +
                        "id INT AUTO_INCREMENT PRIMARY KEY, " +
                        "name VARCHAR(255) NOT NULL, " +
                        "age INT NOT NULL, " +
                        "gender VARCHAR(50) NOT NULL)";
                stmt.executeUpdate(createPatients);
                System.out.println("Table 'patients' ready.");

                // Create doctors table
                String createDoctors = "CREATE TABLE IF NOT EXISTS doctors (" +
                        "id INT AUTO_INCREMENT PRIMARY KEY, " +
                        "name VARCHAR(255) NOT NULL, " +
                        "specialization VARCHAR(255) NOT NULL)";
                stmt.executeUpdate(createDoctors);
                System.out.println("Table 'doctors' ready.");

                // Create appointments table
                String createAppointments = "CREATE TABLE IF NOT EXISTS appointments (" +
                        "id INT AUTO_INCREMENT PRIMARY KEY, " +
                        "patient_id INT NOT NULL, " +
                        "doctor_id INT NOT NULL, " +
                        "appointment_date DATE NOT NULL, " +
                        "FOREIGN KEY (patient_id) REFERENCES patients(id), " +
                        "FOREIGN KEY (doctor_id) REFERENCES doctors(id))";
                stmt.executeUpdate(createAppointments);
                System.out.println("Table 'appointments' ready.");

                System.out.println("Database initialization completed successfully!");

            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
