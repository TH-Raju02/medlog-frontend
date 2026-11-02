export interface TermsSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  after?: string[];
}

export const TERMS_INTRO =
  "Welcome to MedLog. By creating an account or using the application, you acknowledge that you have read, understood, and agreed to comply with these Terms and Conditions.";

export const TERMS_SECTIONS: TermsSection[] = [
  {
    title: "1. Eligibility",
    paragraphs: [
      "MedLog is intended for use only by authorized healthcare professionals and other individuals approved to use the platform in accordance with applicable laws, regulations, and institutional policies. Users are responsible for ensuring that the information provided during account registration is accurate and up to date.",
    ],
  },
  {
    title: "2. Account Security",
    paragraphs: [
      "Users are responsible for maintaining the confidentiality of their account credentials and must not share their login information with any other person. Users are solely responsible for all activities carried out through their account.",
    ],
  },
  {
    title: "3. Patient Data Confidentiality",
    paragraphs: [
      "Users acknowledge that all patient records, medical information, and health-related data accessed or entered through MedLog are confidential and sensitive. Users agree to:",
    ],
    bullets: [
      "Access and use patient information only for authorized professional purposes.",
      "Maintain the confidentiality of all patient information.",
      "Not disclose, copy, photograph, download, or share patient data outside the application unless authorized by applicable laws, regulations, or institutional policies.",
      "Comply with all applicable privacy, confidentiality, and information security policies.",
    ],
  },
  {
    title: "4. Access to Patient Records",
    paragraphs: [
      "Users may only access patient records that have been assigned or made available to them through MedLog in accordance with their authorized role and permissions.",
      "Users are strictly prohibited from accessing, viewing, modifying, copying, or attempting to obtain access to patient records assigned to other users without proper authorization.",
      "The only exception is during an official Patient Handover, where responsibility for a patient's care is transferred from one healthcare professional or unit to another. In such cases, patient information may be shared exclusively through MedLog's designated Handover feature to ensure continuity of care.",
      "Access granted through the Handover process is limited to the information intentionally shared for that purpose. Both the transferring and receiving users remain fully responsible for maintaining the confidentiality of all shared information.",
    ],
  },
  {
    title: "5. Responsibility for Entered Data",
    paragraphs: [
      "Users are solely responsible for all information they enter, update, or modify within MedLog. By using the application, users acknowledge that:",
    ],
    bullets: [
      "The information entered is accurate and complete to the best of their knowledge.",
      "Any inaccuracies, omissions, or errors resulting from data entry are the sole responsibility of the user.",
      "MedLog serves as a documentation and workflow management tool and is not responsible for errors resulting from incorrect data entry or misuse of the application.",
      "MedLog is designed to support clinical documentation, communication, and workflow management. It is not intended to replace the professional judgment, clinical decision-making, or responsibility of healthcare professionals.",
      "MedLog does not provide medical advice, diagnose medical conditions, recommend treatments, or guarantee the accuracy or completeness of clinical decisions made by its users.",
    ],
  },
  {
    title: "6. Acceptable Use",
    paragraphs: ["Users agree not to use MedLog for any unlawful or unauthorized purpose, including but not limited to:"],
    bullets: [
      "Attempting to gain unauthorized access to accounts or patient records.",
      "Attempting to bypass system permissions or security controls, such as trying to access features, patient records, or information that the user's account is not authorized to access.",
      "Disrupting, damaging, or compromising the security or functionality of the application, including any action that interferes with how MedLog operates, weakens its security, or affects other users' ability to use the application safely and reliably.",
      "Accessing or using MedLog over unsecured or public Wi-Fi networks unless connected through a trusted and secure Virtual Private Network (VPN). Users are responsible for ensuring that their network connection provides adequate protection against unauthorized access to confidential patient information.",
      "Using the application in violation of applicable laws, regulations, or institutional policies.",
    ],
  },
  {
    title: "7. Device Security",
    paragraphs: [
      "Users are responsible for ensuring that their device is not left unattended while logged into MedLog. Whenever a device is left unattended, users must log out of the application or lock their device to prevent unauthorized access to patient information.",
      "Failure to log out of MedLog or lock your device when leaving it unattended may result in unauthorized access to confidential patient information. The user is solely responsible for any consequences resulting from leaving the application accessible to others.",
    ],
  },
  {
    title: "8. Account Suspension, Termination, and Subscription",
    paragraphs: [
      "MedLog and/or the user's healthcare facility reserve the right to suspend, restrict, or immediately revoke access to the application under any of the following circumstances:",
    ],
    bullets: [
      "Termination of the user's employment as a healthcare provider.",
      "Suspected unauthorized access, misuse, or violation of these Terms and Conditions.",
      "Expiration, cancellation, or non-renewal of the user's subscription.",
      "Any activity that may compromise patient privacy, data security, or the integrity of the MedLog platform.",
    ],
    after: [
      "If a user's subscription expires or is not renewed, the account will automatically be placed in read-only mode. During this period, users may continue to view their existing records and documentation but will not be able to create, edit, delete, or modify any data.",
      "Upon renewal of the subscription, full access to the account will be restored, and users will regain all editing, documentation, and other account privileges associated with their subscription.",
    ],
  },
  {
    title: "9. Data Deletion",
    paragraphs: [
      "Users acknowledge and agree that once a patient record is permanently deleted through MedLog, the deleted data cannot be recovered or restored by any means.",
      "Users are solely responsible for confirming that a patient record should be permanently deleted before proceeding. MedLog shall not be liable for any loss of data resulting from a user's deletion of patient records.",
    ],
  },
  {
    title: "10. Privacy",
    paragraphs: [
      "Users shall respect patient privacy at all times and shall only access, use, or share patient information as permitted by applicable laws, regulations, institutional policies, and these Terms and Conditions.",
    ],
  },
  {
    title: "11. Disclaimer of Liability",
    paragraphs: [
      "While MedLog implements reasonable measures to ensure system reliability and data protection, it does not guarantee uninterrupted service or immunity from technical failures beyond its control.",
      "Users remain solely responsible for:",
    ],
    bullets: [
      "The accuracy and completeness of the information they enter.",
      "Securing their account and device.",
      "Maintaining the confidentiality of patient information.",
      "Using the platform in compliance with applicable laws, regulations, and institutional policies.",
    ],
    after: [
      "MedLog shall not be liable for any loss, damage, or consequences arising from inaccurate data entry, unauthorized account use, user negligence, misuse of the application, or clinical decisions made by healthcare professionals.",
    ],
  },
  {
    title: "12. Changes to the Terms",
    paragraphs: [
      "MedLog reserves the right to modify these Terms and Conditions at any time. Continued use of the application following the publication of updated Terms constitutes acceptance of those changes.",
    ],
  },
  {
    title: "13. User Acknowledgment",
    paragraphs: ["By creating a MedLog account, the user acknowledges and agrees that:"],
    bullets: [
      "They have read, understood, and accepted these Terms and Conditions.",
      "They are fully responsible for all activities performed through their account.",
      "They are responsible for the accuracy and completeness of all information entered into the application.",
      "They will maintain the confidentiality of all patient information and will not disclose it to any unauthorized individual.",
      "They will not attempt to access patient records assigned to other users except through authorized permissions or the official MedLog Handover process.",
      "They will log out of MedLog or lock their device whenever it is left unattended.",
      "They will not use MedLog on unsecured public Wi-Fi networks unless connected through a trusted VPN.",
      "They understand that MedLog is a documentation and workflow management tool and is not a substitute for professional clinical judgment.",
      "They understand that permanently deleting a patient record cannot be reversed and that deleted data cannot be recovered.",
      "They understand that failure to comply with these Terms may result in suspension or termination of access to MedLog and may also result in disciplinary action, civil liability, or criminal penalties where permitted under applicable laws and institutional policies.",
    ],
  },
];
