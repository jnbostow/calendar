//==============================================================================
//========================== Model-View-Controller =============================
//==============================================================================

const model = {
    add: function(obj) {
        const data = JSON.parse(sessionStorage.events);
        data.push(obj);
        sessionStorage.setItem('events', JSON.stringify(data));
    },
    getAllEvents: function() {
        if (sessionStorage.events) {
            return JSON.parse(sessionStorage.getItem('events'));
        }
    },
    getEventsByMonth: function(month) {
        if (sessionStorage.events) {
            return JSON.parse(sessionStorage.getItem('events'))[month];
        }
    },
    currViewDate: new Date(),
    today: new Date(),
    loading: true
};

const controller = {
    getViewMonthData: function() {
        return model.getEventsByMonth(this.getViewMonth())
    },
    changeMonthBack: function() {
        //will change calendar to prev month
        //set to the 15th to avoid issue from diff month length
        this.setViewDate(15);
        this.setViewMonth(this.getViewMonth()-1);
    },
    changeMonthForward: function() {
        //will change calendar to next month
        //set to the 15th to avoid issue from diff month length
        this.setViewDate(15);
        this.setViewMonth(this.getViewMonth()+1);
    },
    setViewDate: function(day) { model.currViewDate.setDate(day) },
    setViewMonth: function(month) { model.currViewDate.setMonth(month) },
    getViewMonth: function() { return model.currViewDate.getMonth(); },
    getViewYear: function() { return model.currViewDate.getFullYear() },
    getToday: function() { return model.today },
    getLoading: function() { return model.loading },
    setLoading: function(bool) { model.loading = bool; },
    init: function() {
        this.setLoading(false);
        view.render();
    }
};

const view = {
    init: function() {
        const isDataAvail = false;
        this.hook = document.querySelector('#app'); //temp, change this to id
        this.hook.appendChild(this.createCalHTMLSkeleton());
        this.createCalendarHeader();
        this.createCalendar(isDataAvail); //supplying false so a blank calendar is generated
    },
    createCalHTMLSkeleton: function() {
        return createCalendarHTML();
    },
    createCalendarHeader: function() {
        const { getViewMonth, getViewYear } = controller;
        const monthHeaderElem = document.querySelector('#calendar-view h2');

        //creates current month's header text and appends in on DOM
        monthHeaderElem.innerText = createCalendarHeader(getViewMonth(), getViewYear());
    },
    createCalendar: function(dataFlag = true) {
        //if user passes false then no data is supplied
        //if user supplies nothing or true, then data is supplied
        const { getViewMonth, getViewYear, getToday } = controller;
        const calendarDaysElem = document.querySelector('.cal-days');

        //if dataFlag is false, a blank calendar is returned
        const calendarElem = dataFlag? view.addEventDataToCalendar(
            createCalendarGrid(getViewMonth(), getViewYear(), getToday())
        ) : createCalendarGrid(getViewMonth(), getViewYear(), getToday());

        //remove existing cal grid if there is one.
        calendarDaysElem.innerHTML = '';
        calendarDaysElem.appendChild(
            calendarElem
        );
    },
    addEventDataToCalendar: function(calendar) {
        const eventsByDate = controller.getViewMonthData().reduce((acc, event) => {
            const date = new Date(event.date);
            const eventDate = formatDate(date.getDate(), date.getMonth(),date.getFullYear() );
            if(!acc[eventDate]) { acc[eventDate] = [] };
            acc[eventDate].push(event);
            return acc;
        },{});

        Object.keys(eventsByDate).forEach(date => {
            const calendarDateElem = calendar.querySelector(`[datetime='${date}']`);
            calendarDateElem.setAttribute('data-event-count', eventsByDate[date].length);
            calendarDateElem.setAttribute('class','toggle-hover');
            this.addModalEventListeners(calendarDateElem);
            calendarDateElem.appendChild(createEventElement(eventsByDate[date]));
        })

        return calendar
    },
    addModalEventListeners: function(elem) {
        addModalEventListener(elem)
    },
    render: function(){
        if(controller.getLoading) {
            document.querySelector('.loader').style.display = 'none'
        }
        this.createCalendarHeader();
        this.createCalendar();
    }
};

//==============================================================================
//======================= DOM Manipulation Functions ===========================
//==============================================================================

//creates the basic calendar HTML skeleton
//returns DOM element
function createCalendarHTML() {
    const calendarContainer = document.createElement('section')
    calendarContainer.id = 'calendar-view'
    calendarContainer.innerHTML =
        `
            <!--displays before API data loads-->
            <div class="loader"></div>
            <div class="cal-nav">
                <i class="material-icons cal-nav-back">navigate_before</i>
                    <h2> <!-- Name of Month --> </h2>
                <i class="material-icons cal-nav-forward">navigate_next</i>
            </div>

            <div class="modal">
                <div class="modal-content"></div>
            </div>

            <div class="cal-row-header">
                <span>SUNDAY</span>
                <span>MONDAY</span>
                <span>TUESDAY</span>
                <span>WEDNESDAY</span>
                <span>THURSDAY</span>
                <span>FRIDAY</span>
                <span>SATURDAY</span>
            </div>
            <div class="cal-days toggle-hover">
                <!--calendar.js to fill in grid based on current day-->
            </div>`

    //add listener for back navigation button
    //will change calendar to prev month
    calendarContainer.querySelector('.cal-nav-back')
        .addEventListener('click', function() {
            controller.changeMonthBack();
            view.render();
        });

    //add listener for forward navigation button
    //will change calendar to next month
    calendarContainer.querySelector('.cal-nav-forward')
        .addEventListener('click', function() {
            controller.changeMonthForward();
            view.render();
        });

    //add listener for modal to close when the x or any other
    // portion of the screen is selected
    calendarContainer.addEventListener('click', function(event) {
        if (event.target.className === 'modal' || event.target.className === 'close') {
            document.querySelector('.modal').style.display = 'none';
            document.querySelector('.modal-content').innerHTML = '';
            document.querySelector('#calendar-view').classList.toggle("toggle-hover"); //adds hover functionality back
        }
    })

    return calendarContainer;
}


//returns text of the current month and year
function createCalendarHeader(month, year){
    //returns the a string of the month based on the parameter's month
    function getCurrentMonthText(month) {
        let months = ['january','february','march','april','may','june','july',
            'august','september','october','november','december'];
        return months[month];
    }
    return getCurrentMonthText(month).toUpperCase() + ' ' + year;
}

//creates a fragment with time elements corresponding to the viewMonth, viewYear params
//will add the class attr 'today' if the time element matches to the today param
function createCalendarGrid (viewMonth, viewYear, today) {
    const frag = document.createDocumentFragment();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1 ).getDay() +1;
    const lastDayOfMonth = new Date(viewYear, viewMonth +1, 0 ).getDate();
    let calendarDay = 1;

    //all calendars will be a 5x7 grid, this will be a total of 35 days
    //for rare cases the grid is 6x7, see cases below
    //loop through each item (Box) on calendar grid, if box is a day of month
    //add correct datetime attribute and child div with class="date-num" and
    //day of month as innertext.  Also, check to see if box is today's date,
    //if so add class="today".

    //box limit is 5x7 by default
    let dayBoxLimit = 35
    //box limit goes to 6x7 in the cases below
    if(firstDayOfWeek === 6 && lastDayOfMonth > 30) {
        dayBoxLimit = 42;
    } else if(firstDayOfWeek === 7 && lastDayOfMonth >= 30) {
        dayBoxLimit = 42;
    }

    for(let dayBox=1; dayBox <= dayBoxLimit; dayBox++) {
        if (dayBox >= firstDayOfWeek &&
            dayBox-firstDayOfWeek < lastDayOfMonth)
        {
            frag.appendChild(createTimeElement(calendarDay, viewMonth, viewYear, today))
            calendarDay++;
        } else {
            frag.appendChild(document.createElement('time'));
        }
    }
    return frag;
};

//return an time element
//sets datetime attr to year, month, day parameters
//sets class attr of "today" if date param matches today param
function createTimeElement(day, month, year, today) {
    const timeElem = document.createElement('time')
    timeElem.setAttribute('datetime', formatDate(day, month, year))

    //if the date is today then add a today class
    today.toDateString() === new Date(year, month, day).toDateString()
    && (timeElem.setAttribute('class', 'today'));

    timeElem.innerHTML = `<div class="date-num">${day}</div>`

    return timeElem;
}
//takes an array of events for a day.
//parameter must have events with proper format.  See API details below.
//returns a DOM element of the event details for that day.
//this DOM element is meant to populate each calendar day with event details
function createEventElement(dayEvents) {
    //get the name of each event (max 40 chars), append them to an li
    //these will be displayed in calendar view
    const eventListElem = document.createElement('ul');
    const eventDetailsElem = document.createElement('div');
    eventDetailsElem.setAttribute('class','event-details');

    dayEvents.forEach(function(event){
        const time = new Date(event.date).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});
        const shortEventTitle = event.title.length > 43? event.title.substring(0,40).concat('...'): event.title;
        const eventListItemElem = document.createElement('li');
        eventListItemElem.setAttribute('data-event-id', event.id);

        eventListItemElem.innerHTML =
            `<div class="event-name-short">
                ${shortEventTitle}
            </div>
            <div class="event-time">
                ${time}
            </div>
            <div class="event-name-long">
                ${event.title}
            </div>
            `;
        eventListElem.appendChild(eventListItemElem);
    });


    if(dayEvents.length > 1) {
        const eventCountDisplay = document.createElement('div');
        eventCountDisplay.setAttribute('class', 'event-display-count-container');
        eventCountDisplay.innerHTML =
            `<div class="event-display-count-container"> 
                <div class="event-display-count"> 
                ${dayEvents.length-1} more event${dayEvents.length>2? 's': ''}
                <i class="material-icons">expand_more</i>
            </div>`

        eventDetailsElem.appendChild(eventCountDisplay);
    }

    eventDetailsElem.appendChild(eventListElem);
    return eventDetailsElem;
}

//takes a DOM element and adds a listener to display the modal with that elements details
//is meant to be added to each calendar day with event information
function addModalEventListener(dayElem) {
    dayElem.addEventListener('click', function(event) {
        const modalContentElem = document.querySelector('.modal-content');
        document.querySelector('#calendar-view').classList.toggle("toggle-hover"); //removes toggle-hover
        document.querySelector('.modal').style.display = 'block';
        modalContentElem.innerHTML = '<span class="close">&times;</span>' + this.innerHTML;
    })
}

//==============================================================================
//============================ Helper Functions ================================
//==============================================================================

//returns string of YYYY-MM-DD
function formatDate(day, month, year) {
    day = day < 10? '0' + day : day;
    month = (++month) < 10? '0' + month : month;
    return year + '-' + month + '-' + day;
}

//gets events and returns an object with events organized by month
//is zero based just like Date object's getMonth() method.
//january is index 0
function toDataByMonth(events) {
    const byMonth = [];

    for(let month =0; month < 12; month++) {
        byMonth.push(events.filter(function(event) {
            return new Date(event.date).getMonth() === month;
        }));
    }
    return byMonth;
}

//==============================================================================
//============================== API Functions =================================
//==============================================================================

//all API's must return an array of event objects in the following format
/*
    {
        id: number,
        title: string,
        link: string,
        data: number
    }
*/

//fetches data from the Event Brite API
function eventBriteAPI() {
    const apiKey = 'Y2BBFOMVYZPIMVNNOGLW'
    const params = 'location.address=Seattle&q=tech'
    const eventBriteURL =
        `https://www.eventbriteapi.com/v3/events/search/?token=${apiKey}&${params}&include_all_series_instances=false`

    return fetch(eventBriteURL)
        .then(res => res.json())
        .then(data => {
            if (data.events.length) {
                const eventsFormated = briteEventFormatObject(data.events);
                sessionStorage.setItem('events', JSON.stringify(toDataByMonth(eventsFormated)));
            }
            return new Promise(function(resolve, reject) {
                resolve('Success!');
            });
        })

    function briteEventFormatObject(events) {
        let id = 1;
        return events.map(event => {
            return {
                id: `${id++}-eb`,
                title: event.name.text,
                link: event.url,
                date: event.start.local
            }
        })
    }
}

//==============================================================================
//============================= Calling Functions  =============================
//==============================================================================

window.onload = function(){
    view.init();
    const fetchData = eventBriteAPI;
    if (!sessionStorage.events) {
        fetchData().then(() => controller.init());
    } else {
        controller.init()
    }
}

