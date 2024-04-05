<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

A Telegram bot for roommates to maintain a cleaning schedule, which is provided as a separate Google Calendar.

On Monday Roommie sends a notification to the group chat and private messages with description of a task for users on duty. On Thursday-Saturday it sends a private reminder which a user can snooze. On Sunday users receive the final reminder, if they won't mark the task as done, it will be failed.

Calendar event must start on Monday and a title should contain the name of the room to be cleaned and a TG username (Kitchen @userName).

User's details and tasks are stored in MongoDB Atlas.