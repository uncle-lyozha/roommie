export enum taskStatus {
    new = "new",
    pending = "pending",
    snoozed = "snoozed",
    done = "done",
    failed = "failed",
}

export enum moveEnum {
    forward = "forward",
    backwards = "backwards"
}

export enum actionMenuOption {
    edit = "edit",
    moveUserFwd = "moveFwd",
    moveUserBck = "moveBck",
    addUser = "addUser",
    delUser = "delUser",
    renameJob = "renameJob",
    editDescr = "editDescr",
    addJob = "addJob",
    deleteJob = "deleteJob",
    exit = "exit",
    null = "empty",
    confirm = "confirm"
}

export enum cbType {
    job = "job",
    edit = "edit",
    editMenu = "editMenu",
    story = "story"
}