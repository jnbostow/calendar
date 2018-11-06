window.onload = function(){

    const model = {
        init: function() {
            if (!localStorage.notes) {
                localStorage.notes = JSON.stringify([]);
            }
        },
        add: function(obj) {
            var data = JSON.parse(localStorage.notes);
            data.push(obj);
            localStorage.notes = JSON.stringify(data);
        },
        getAllNotes: function() {
            return JSON.parse(localStorage.notes);
        },
        currViewDate: new Date(),
        today: new Date(),
        setViewDate: function(day) { this.currViewDate.setDate(day) },
        setViewMonth: function(month) { this.currViewDate.setMonth(month) },
        getViewMonth: function() {
            return this.currViewDate.getMonth();
        },
        getViewYear: function() {
            return this.currViewDate.getFullYear();
        },
        getToday: function() {
            return this.today
        }
    };


    var controller = {
        changeMonthBack: function() {
            //will change calendar to prev month
            //set to the 15th to avoid issue from diff month length
            model.setViewDate(15);
            model.setViewMonth(model.getViewMonth()-1);
        },
        changeMonthForward: function() {
            //will change calendar to next month
            //set to the 15th to avoid issue from diff month length
            model.setViewDate(15);
            model.setViewMonth(model.getViewMonth()+1);
        },
        getViewMonth: function() { return model.getViewMonth() },
        getViewYear: function() { return model.getViewYear() },
        getToday: function() { return model.getToday() },
        init: function() {
            model.init();
            view.init();
        }
    };


    const view = {
        init: function() {
            this.hook = document.querySelector('.app'); //temp, change this to id
            this.hook.appendChild(this.createCalHTMLSkeleton());

            view.render();
        },
        createCalHTMLSkeleton: function() {
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

            return calendarContainer;
        },
        createCalendarHeader: function() {
            const { getViewMonth, getViewYear } = controller;
            const monthHeaderElem = document.querySelector('#calendar-view h2');

            //creates current month's header text and appends in on DOM
            monthHeaderElem.innerText = createCalendarHeader(getViewMonth(), getViewYear());
        },
        createCalendar: function() {
            const { getViewMonth, getViewYear, getToday } = controller;
            const calendarDaysElem = document.querySelector('.cal-days');

            //remove existing cal grid if there is one.
            calendarDaysElem.innerHTML = '';
            calendarDaysElem.appendChild(
                createCalendarGrid(getViewMonth(), getViewYear(), getToday())
            );
        },
        render: function(){
            this.createCalendarHeader();
            this.createCalendar();
        }
    };

    view.init();


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

    //returns string of YYYY-MM-DD
    function formatDate(day, month, year) {
        day = day < 10? '0' + day : day;
        month = (++month) < 10? '0' + month : month;
        return year + '-' + month + '-' + day;
    }
};