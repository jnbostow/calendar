function eventBrite() {
    const events = JSON.parse(sessionStorage.getItem("briteEventsByMonth"))
    console.log(events)
}
eventBrite()

