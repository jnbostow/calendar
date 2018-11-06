const apiKey = 'Y2BBFOMVYZPIMVNNOGLW'
const params = 'location.address=Seattle&q=tech'
const eventBriteURL = `https://www.eventbriteapi.com/v3/events/search/?token=${apiKey}&${params}&include_all_series_instances=false`


fetch(eventBriteURL)
    .then(res => res.json())
    .then(data => {
        if (data.events.length) {
            const eventsByMonth = briteEventByMonthObject(data.events);
            sessionStorage.setItem('briteEventsByMonth', JSON.stringify(eventsByMonth));
        }
    })


//gets events and returns an object with events organized by month
//is zero based just like Date object's getMonth() method.
//january is index 0
function briteEventByMonthObject(events) {
    let byMonth = [];

    for(let month =0; month < 12; month++) {
        byMonth.push(events.filter(function(event) {
            return Number(event.start.local.substring(5,7))-1 === month;
        }));
    }

    return byMonth;
}