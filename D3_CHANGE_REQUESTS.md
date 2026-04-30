# D3_CHANGE_REQUESTS.md

This document analyzes the features implemented during Phase 2 Part 2 and breaks them down into specific Change Requests (CR). As per the requirements, 8 change requests are categorized into four types: Corrective, Adaptive, Perfective, and Preventive.

---

## 1. Corrective Maintenance
*Focuses on fixing errors or bugs identified in the new features.*

### CR-01: Toast Notification Duplication Fix
| Attribute | Description |
| :--- | :--- |
| **Associated Feature** | Notification System |
| **Description** | Fix an issue where toast notifications repeat unnecessarily during data polling intervals even if the booking status remains unchanged. |
| **Maintenance Type** | Corrective |
| **Priority** | High |
| **Severity** | Major |
| **Time to Implement** | 0.5 person-day |
| **Verification Method** | Monitor the Dashboard UI to ensure a notification appears only once per status change. |

### CR-02: Support Chat Text Overflow Fix
| Attribute | Description |
| :--- | :--- |
| **Associated Feature** | Customer Support System |
| **Description** | Resolve a UI bug in the Chat Window where long, continuous strings of text (e.g., long URLs or unspaced words) overflow the message bubble. |
| **Maintenance Type** | Corrective |
| **Priority** | Medium |
| **Severity** | Minor |
| **Time to Implement** | 0.5 person-day |
| **Verification Method** | Test sending long strings in the chat and verify that text wraps correctly within the bubble. |

---

## 2. Adaptive Maintenance
*Focuses on adjusting the system to work in a new or changed environment.*

### CR-03: Mobile App API Compatibility
| Attribute | Description |
| :--- | :--- |
| **Associated Feature** | Support & Notification Backend |
| **Description** | Modify API endpoints and JSON response structures to ensure full data compatibility with the new Native Android platform. |
| **Maintenance Type** | Adaptive |
| **Priority** | High |
| **Severity** | Critical |
| **Time to Implement** | 1.0 person-day |
| **Verification Method** | Perform integration testing to confirm successful data retrieval on the Android Client. |

### CR-04: Tablet-Responsive UI Adjustment
| Attribute | Description |
| :--- | :--- |
| **Associated Feature** | Web Interface |
| **Description** | Update CSS for the Alert Banner and Chat Interface to be fully responsive for tablet-sized viewports and orientations. |
| **Maintenance Type** | Adaptive |
| **Priority** | Medium |
| **Severity** | Minor |
| **Time to Implement** | 0.5 person-day |
| **Verification Method** | Inspect the layout using Browser Developer Tools across various tablet resolutions. |

---

## 3. Perfective Maintenance
*Focuses on improving performance, maintainability, or user experience.*

### CR-05: Alert Banner Visual Enhancement
| Attribute | Description |
| :--- | :--- |
| **Associated Feature** | Notification System |
| **Description** | Enhance the Alert Banner with a scrolling Marquee effect and a shaking bell icon to better catch the user's attention for upcoming bookings. |
| **Maintenance Type** | Perfective |
| **Priority** | Low |
| **Severity** | Cosmetic |
| **Time to Implement** | 0.5 person-day |
| **Verification Method** | Visual inspection of the Dashboard to verify animation smoothness. |

### CR-06: Quick Reply Support Buttons
| Attribute | Description |
| :--- | :--- |
| **Associated Feature** | Customer Support System |
| **Description** | Implement "Quick Reply" or "Common Inquiry" buttons in the chat UI to allow users to send standard questions with a single click. |
| **Maintenance Type** | Perfective |
| **Priority** | Medium |
| **Severity** | Minor |
| **Time to Implement** | 1.0 person-day |
| **Verification Method** | Verify that clicking a quick-reply button correctly populates and sends the message. |

---

## 4. Preventive Maintenance
*Focuses on improving software to prevent future problems or make it easier to maintain.*

### CR-07: Notification Logic Refactoring
| Attribute | Description |
| :--- | :--- |
| **Associated Feature** | Backend Shared Logic |
| **Description** | Refactor the notification counting and filtering logic in `server.js` into a dedicated utility module to improve code maintainability. |
| **Maintenance Type** | Preventive |
| **Priority** | Medium |
| **Severity** | Minor |
| **Time to Implement** | 1.0 person-day |
| **Verification Method** | Run existing unit tests to ensure no regressions in notification functionality. |

### CR-08: Global API Error Handling
| Attribute | Description |
| :--- | :--- |
| **Associated Feature** | Overall Frontend |
| **Description** | Implement standardized Try-Catch blocks and user-friendly error messages for all Support API fetch calls to prevent UI crashes during downtime. |
| **Maintenance Type** | Preventive |
| **Priority** | High |
| **Severity** | Major |
| **Time to Implement** | 1.0 person-day |
| **Verification Method** | Simulate server failures and confirm that the UI remains stable and displays error alerts. |