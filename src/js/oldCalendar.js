function model() {
    const calendarContainer = document.createElement('section')
    calendarContainer.id = 'calendar-view'
    calendarContainer.innerHTML = 
        `<div class="cal-nav">
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

    const navBack = calendarContainer.querySelector('.cal-nav-back');

    navBack.click(function() {
        let backDate;

        date.setDate(15); //set to the 15th to avoid issue from diff month length
        date.setMonth(date.getMonth()-1);
        backDate = date;
        createCalendar(backDate, $monthHeader, $calendarDaysGrid);
    });


    const hook = document.getElementById('app');
    hook.appendChild(calendarContainer);
}
//model();


let date = new Date();
let today = new Date();
let $monthHeader = $('#calendar-view h2');
let $calendarDaysGrid = $('.cal-days');
let $navBack = $('.cal-nav-back');
let $navForward = $('.cal-nav-forward');
let $eventDays;


//add calendar based on today's date.
//the today variable will change based on use of nav buttons

//add listener for back navigation button
//will change calendar to prev month
$navBack.click(function() {
    let backDate;

    date.setDate(15); //set to the 15th to avoid issue from diff month length
    date.setMonth(date.getMonth()-1);
    backDate = date;
    createCalendar(backDate, $monthHeader, $calendarDaysGrid);
});

//add listener for forward navigation button
//will change calendar to next month
$navForward.click(function() {
    let forwardDate;

    date.setDate(15); //set to the 15th to avoid issue from diff month length
    date.setMonth(date.getMonth()+1);
    forwardDate = date;
    createCalendar(forwardDate, $monthHeader, $calendarDaysGrid);
});


$('#calendar-view').on('click', "time[data-event-count]", function(event) {
    $('.cal-days').removeClass('toggle-hover');
    $('.modal').css('display', 'block');
    $('.modal-content').append('<span class="close">&times;</span>');
    $('.modal-content').append($(this).children().clone());
});

$('#calendar-view').click(function(event) {
    if (event.target.className === 'modal' || event.target.className === 'close') {
        $('.modal').css('display', 'none');
        $('.modal-content').empty();
        $('.cal-days').addClass('toggle-hover');
    }
});

function createCalendar(date, $headerDOM, $calendarGridDOM) {
    let $eventDays;
//remove existing cal grid if there is one.
    $calendarGridDOM.empty();

//append elements
    $headerDOM.text(getCurrentMonth(date).toUpperCase() + ' ' + date.getFullYear());
    $calendarGridDOM.append(getCalendarGrid(date, today));

//returns the a string of the month based on the parameter's date object
    function getCurrentMonth(date) {
        let months = ['january','february','march','april','may','june','july',
            'august','september','october','november','december'];
        return months[date.getMonth()];
    }

//creates an array of time elements with the datetime attribute set to the
// months of the parameter's date object
    function getCalendarGrid (date, today) {
        let daysArray= [];
        let firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1 );
        let lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() +1, 0 );
        let firstWeekDay = firstDayOfMonth.getDay() +1;
        let calendarDate = firstDayOfMonth;
        let currMonthEventData = JSON.parse(sessionStorage.getItem("briteEventsByMonth"))[date.getMonth()];
        let currDayEventData;

        for(let dayBox=1; dayBox <= 35; dayBox++) {
            if (dayBox >= firstWeekDay &&
                dayBox-firstWeekDay <
                lastDayOfMonth.getDate())
            {
                currDayEventData = currMonthEventData.filter(function(event) {
                    return Number(event.start.local.substring(8,10)) === calendarDate.getDate();
                });

                daysArray.push(createTimeElement(calendarDate, today, currDayEventData)
                    .append(createEventDetailsElement(currDayEventData))
                );

                calendarDate.setDate(calendarDate.getDate() + 1);

            } else {
                daysArray.push($('<time></time>'));
            }
        }

        return daysArray;


        //return an time element wrapped in a jQuery object
        //sets datetime attr to date parameter
        //sets class attr of "today" if date param matches today param
        function createTimeElement(date, today, currDayEventData) {
            let attrObj = {};

            attrObj['datetime'] = datetimeFormatConverter(date);

            //if this day has an event add a data-event attribute w event count
            currDayEventData.length > 0
                && (attrObj['data-event-count'] = currDayEventData.length);

            //if the date is today then add a today class
            today.toDateString() === date.toDateString()
                && (attrObj['class'] = 'today');

            return $('<time></time>')
                .attr(attrObj)
                .append($('<div class="date-num">').text(calendarDate.getDate()));

            //HTML datetime attr syntax YYYY-MM-DDThh:mm:ssTZD
            //converts Javascript's Date object format to HTML attr format
            function datetimeFormatConverter(date) {
                let day = date.getDate() < 10?
                    String('0' + date.getDate())
                    :
                    date.getDate();

                let month = date.getMonth() + 1;
                month = month < 10? String('0' + month) : month;

                return date.getFullYear() + '-' + month + '-' + day;
            }
        }

        function createEventDetailsElement(currDayEventData) {
            //get the name of each event (max 40 chars), append them to an li
            //these will be displayed in calendar view

            let eventCountDisplay = '';

            currDayEventData.sort((function (a, b) {
                let aDate = new Date(a.start.local);
                let bDate = new Date(b.start.local);
                return aDate - bDate;
            }));

            let eventDetails = $('<ul>').append(currDayEventData.map(function(event){
                let time = new Date(event.start.local);
                let eventStatus = event.status.toLowerCase() === 'live'? 'open': event.status;
                let isFree = event.is_free? 'FREE':'';
                let shortEventStr = currDayEventData.length > 1? event.name.text.substring(0,40).concat('...'): event.name.text;
                let eventNameLong = '<em><b><span class="uppercase">' + eventStatus +
                                    '</span></b></em> <a href="' + event.url + '" target = "_blank" >' + event.name.text +
                                    '</a> <em><span id="free-style">' + isFree + '</span></em>';
                return $('<li>').attr('data-event-id', event.id)
                                .append(
                                    $('<div class="event-name-short">')
                                        .append(shortEventStr),
                                    $('<div class="event-time">').text(time.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})),
                                    $('<div class="event-name-long">')
                                        .append(eventNameLong)
                                );
                })
            );

            if(currDayEventData.length > 1) {
                eventCountDisplay += '<div class="event-display-count-container">' +
                    '<div class="event-display-count">' +
                    + (currDayEventData.length-1)  + ' more event';

                eventCountDisplay += currDayEventData.length > 1 && 's';
                eventCountDisplay += '<i class="material-icons">expand_more</i></div>';
            }

            return $('<div class="event-details">').append(eventDetails, eventCountDisplay);
        }
    };
}


//let storage = JSON.parse(sessionStorage.getItem("briteEvents"));
//storage.map(function(event) {console.log(event)});


