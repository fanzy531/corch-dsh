# Teaching Reform Workbench

English | [中文](README.zh.md)

After users confirm the JD sample and generate typical work tasks, the workbench writes `typical-work-tasks.md` and a human-readable `typical-work-tasks.html` beside the job data. The HTML report follows the supplied capability-map example styling, and its “Read report” action opens the saved HTML with the host default application, normally a browser. The report records the task descriptions, sample frequency hints, source JD ids, professional ability tags, confirmed job details, and source links. Task definitions and frequency interpretation follow the JD-driven capability mapping methodology: tasks are verb-led, independently deliverable activities supported by JD evidence, while sample frequency is not a market-wide statistic.

A search result immediately creates a sidebar project record keyed by its DSH session id. Project listing metadata and excluded job ids are stored in browser local storage, with a volatile in-memory fallback while the client is running. Job data and the reports are stored in the DSH workspace through the active session's file tools; a failed file write remains visible in the workbench and does not remove the project from the sidebar.
