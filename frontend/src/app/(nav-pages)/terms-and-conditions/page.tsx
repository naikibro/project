import { Container, Typography } from "@mui/material";
import Link from "next/link";

export default async function TermsAndConditionsPage() {
  const projectName = process.env.PROJECT_NAME;
  return (
    <Container maxWidth="md" sx={{ py: 6, textAlign: "left" }}>
      <Typography variant="h2">
        Terms and Conditions for {projectName} by {projectName}
      </Typography>
      <br />
      <br />

      <Typography variant="h4">1. Introduction</Typography>
      <br />
      <p>
        Welcome to {projectName}, a service provided by {projectName}. By
        accessing and using this platform, you agree to abide by the following
        Terms and Conditions. If you do not agree with any part of these terms,
        please discontinue the use of {projectName} immediately.
      </p>
      <br />

      <Typography variant="h4">2. Definitions</Typography>
      <br />
      <ul>
        <li>
          <strong>&quot;{projectName}&quot;</strong> refers to the application
          and services provided by {projectName}.
        </li>
        <li>
          <strong>&quot;User&quot;</strong> refers to any individual accessing
          or using {projectName}.
        </li>
        <li>
          <strong>&quot;Services&quot;</strong> include but are not limited to
          user account management and many more
        </li>
      </ul>
      <br />

      <Typography variant="h4">3. Account Registration and Security</Typography>
      <br />
      <p>
        Users may be required to create an account to access certain features.
        Users are responsible for maintaining the confidentiality of their login
        credentials. Any unauthorized use of an account should be reported
        immediately to {projectName} administrators.
      </p>
      <br />

      <Typography variant="h4">4. User Responsibilities</Typography>
      <br />
      <ul>
        <li>
          Users agree to provide accurate and up-to-date information when using
          the services.
        </li>
        <li>
          Users shall not misuse the platform by submitting false or misleading
          information.
        </li>
        <li>
          Users must comply with all applicable laws and regulations while using
          {projectName}.
        </li>
      </ul>
      <br />

      <Typography variant="h4">5. Data Collection and Privacy</Typography>
      <br />
      <p>
        {projectName} collects and processes data in accordance with its Privacy
        Policy. Location data may be used to provide pertinent services and
        suggestions. Users have the right to request access or deletion of their
        personal data.
      </p>
      <br />

      <Typography variant="h4">6. Intellectual Property</Typography>
      <br />
      <p>
        All content, trademarks, and proprietary information on {projectName}{" "}
        are owned by {projectName}. Users may not reproduce, distribute, or
        modify any part of {projectName} without prior written consent.
      </p>
      <br />

      <Typography variant="h4">7. Limitation of Liability</Typography>
      <br />
      <p>
        {projectName} provides information &ldquo;as is&ldquo; without
        warranties of any kind. {projectName} is not responsible for inaccurate
        data, system downtime, or damages resulting from the use of{" "}
        {projectName}. Users acknowledge that navigation and traffic updates
        depend on real-time community input and external sources.
      </p>
      <br />

      <Typography variant="h4">
        8. Service Modifications and Termination
      </Typography>
      <br />
      <p>
        {projectName} reserves the right to modify or discontinue any part of
        {projectName} without prior notice. Users who violate these terms may
        have their access revoked.
      </p>
      <br />

      <Typography variant="h4">9. Dispute Resolution</Typography>
      <br />
      <p>
        Any disputes arising from the use of {projectName} shall be resolved
        through mediation or legal action in accordance with applicable laws.
      </p>
      <br />

      <Typography variant="h4">10. Contact Information</Typography>
      <br />
      <p>
        For any questions or concerns regarding these Terms and Conditions,
        please contact {projectName} at{" "}
        <Link href="mailto:naikibro@gmail.com">naikibro@gmail.com</Link>.
      </p>
      <br />

      <p>
        By using {projectName}, you acknowledge that you have read, understood,
        and agreed to these Terms and Conditions.
      </p>
      <br />
    </Container>
  );
}
