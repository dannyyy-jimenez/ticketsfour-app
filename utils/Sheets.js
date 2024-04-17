import { registerSheet } from "react-native-actions-sheet";

import { PreTaskCreateSheet } from "./sheets/PreTask";
import { ViewTaskSheet } from "./sheets/Task";
import { EmployeeAssignSheet, EmployeeCreateSheet } from "./sheets/Employee";
import ViewQuoteSheet from "./sheets/Quote";

registerSheet("quote-view-sheet", ViewQuoteSheet);
registerSheet("task-view-sheet", ViewTaskSheet);
registerSheet("pretask-create-sheet", PreTaskCreateSheet);
registerSheet("employee-create-sheet", EmployeeCreateSheet);
registerSheet("employee-assign-sheet", EmployeeAssignSheet);

export {};
