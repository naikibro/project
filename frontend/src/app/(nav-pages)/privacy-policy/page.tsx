import { Container, Typography } from "@mui/material";
import Link from "next/link";

export default async function PrivacyPolicyPage() {
  const projectName = process.env.PROJCT_NAME;

  return (
    <Container maxWidth="md" sx={{ py: 6, textAlign: "left" }}>
      <Typography variant="h2">
        Privacy Policy for {projectName} by {projectName}
      </Typography>
      <br />
      <br />

      <Typography variant="h4">1. Introduction</Typography>
      <br />
      <p>
        Welcome to {projectName}, a service provided by PACIFIC KNOWLEDGE. This
        Privacy Policy explains how we collect, use, disclose, and safeguard
        your information when you use our platform. By accessing or using{" "}
        {projectName}, you agree to the practices described herein.
      </p>
      <br />

      <Typography variant="h4">2. Information We Collect</Typography>
      <br />
      <p>
        We collect various types of information to enhance your experience on
        {projectName}. This includes:
      </p>
      <ul>
        <li>
          <strong>Personal Data:</strong> Information such as your name, email
          address, and other details provided during registration or profile
          updates.
        </li>
        <li>
          <strong>Usage Data:</strong> Details on how you interact with{" "}
          {projectName}, including IP address, browser type, and access times.
        </li>
      </ul>
      <br />

      <Typography variant="h4">3. How We Use Your Information</Typography>
      <br />
      <p>Your information is used to:</p>
      <ul>
        <li>Provide and improve our services</li>
        <li>Personalize your experience on {projectName}</li>
        <li>Communicate updates and support messages</li>
        <li>Ensure the security and integrity of our platform</li>
      </ul>
      <br />

      <Typography variant="h4">4. Sharing Your Information</Typography>
      <br />
      <p>
        We may share your data with trusted third parties who assist in
        operating our service, or as required by law. All such parties are
        obligated to maintain the confidentiality of your information.
      </p>
      <br />

      <Typography variant="h4">5. Security</Typography>
      <br />
      <p>
        We implement industry-standard security measures to protect your
        personal data. However, please note that no method of transmission over
        the internet or electronic storage is 100% secure.
      </p>
      <br />

      <Typography variant="h4">6. Your Rights</Typography>
      <br />
      <p>
        You have the right to access, correct, or delete your personal
        information. For any questions regarding your data or to exercise your
        rights, please contact us at{" "}
        <Link href="mailto:naikibro@gmail.com">naikibro@gmail.com</Link>.
      </p>
      <br />

      <Typography variant="h4">7. Changes to This Privacy Policy</Typography>
      <br />
      <p>
        We may update this Privacy Policy from time to time. Any changes will be
        posted on this page with an updated &quot;Last Updated&quot; date.
        Please review this policy periodically for any updates.
      </p>
      <br />

      <Typography variant="h4">8. Contact Information</Typography>
      <br />
      <p>
        If you have any questions or concerns about this Privacy Policy, please
        contact PACIFIC KNOWLEDGE at{" "}
        <Link href="mailto:naikibro@gmail.com">naikibro@gmail.com</Link>.
      </p>
      <br />

      <p>
        By using {projectName}, you acknowledge that you have read, understood,
        and agree to this Privacy Policy.
      </p>
      <br />
    </Container>
  );
}
