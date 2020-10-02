"use strict";

let dateFormater = {
  Week: {
    'fr-FR': {
      'long': ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
      'short': ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'],
      'narrow': ['L', 'M', 'M', 'J', 'V', 'S', 'D']
    }
  },

  Month: {
    'fr-FR': {
      'long': ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
      'short': ['Jan.', 'Fev.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Jui.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
      'narrow': ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
    }
  },

  formatFr(dateObject) {
    return (
      ("0" + dateObject.getDate()).slice(-2) +
      "/" +
      ("0" + (dateObject.getMonth() + 1)).slice(-2) +
      "/" +
      dateObject.getFullYear()
    );
  },

  formatFrLong(dateObject) {
    return (
      ("0" + dateObject.getDate()).slice(-2) +
      " " +
      this.Month['fr-FR']['long'][dateObject.getMonth()] +
      " " +
      dateObject.getFullYear()
    )
  },

  formatEn(string) {
    let array = string.split('/');
    let year = array[2];
    let month = array[1];
    let day = array[0];
    return [month, day, year].join('/');
  },

  numberOfDay(year, month) {
    return new Date(year ?? this.getFullYear(), month ?? (this.getMonth() + 1), 0).getDate();
  },

  /**
  * @param {Number} year - the requested year
  * @param {Number} month - of the request month
  * @param {Object} option - format type (numeric || long)
  */
  firstDayOfMonth(dirtyYear, dirtyMonth, dirtyOption) {
    let year = dirtyYear ?? this.getFullYear();
    let month = dirtyMonth - 1 ?? this.getMonth();
    let option = dirtyOption ?? {};
    let firstDay = new Date(year ?? this.getFullYear(), month, 1).toLocaleString("default", { weekday: 'long' });
    return option.format != 'numeric' ? this.Week['fr-FR'].long.indexOf((firstDay + '').charAt(0).toUpperCase() + firstDay.substr(1)) : firstDay;
  }
}

class DatePicker extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    const template = document.importNode(document.getElementById('template').content, true);
    root.appendChild(template);
    this.selectedDate = this.getAttribute('date') ?? dateFormater.formatFr(new Date());
    if(this.selectedDate.length != 10) throw new Error("Verifiez le format de la date => doit être 'jj/mm/aaaa'")
  }

  get day() {
    return this.selectedDate.slice(0, 2);
  }

  get month() {
    return parseInt(this.selectedDate.slice(3, 5));
  }

  get year() {
    return parseInt(this.selectedDate.slice(6, 10));
  }

  set month(value) {
    this.selectedDate = [this.day, ("0" + value).slice(-2), this.year].join('/');
    this.shadowRoot.getElementById('selectedDate').innerHTML = this.formatLong();
  }

  set year(value) {
    this.selectedDate = [this.day, ("0" + this.month).slice(-2), value].join('/');
  }

  connectedCallback() {
    // Append selectedDate
    this.shadowRoot.getElementById('selectedDate').innerHTML = this.selectedDate;
    this.shadowRoot.addEventListener('click', this.openModal);
  }

  renderDays = () => {
    let highlightedDay = this.highLightDay();
    let firstDayIndex = dateFormater.firstDayOfMonth(this.year, this.month, 'numeric');
    let dayAmount = dateFormater.numberOfDay(this.year, this.month);
    let numberOfDay = 1;
    let container = this.shadowRoot.getElementById('dayContainer');
    container.innerHTML = '';
    for (let i = 0; i < 42; i++) {
      let day = document.createElement('span');
      if(i >= firstDayIndex && numberOfDay <= dayAmount) {
        day.classList.add('selectable');
        day.innerHTML = numberOfDay;
        if(numberOfDay == parseInt(highlightedDay)) day.classList.add('selected')
        day.addEventListener('click', this.selectDate)
        numberOfDay++;
      }
      container.append(day);
    }
  }

  subMonth = () => {
    if (this.month == 1) { this.year--; this.month = 12; }
    else this.month--;
    this.renderDays();
  }

  addMonth = () => {
    if (this.month == 12) { this.year++; this.month = 1; }
    else this.month++;
    this.renderDays();
  }

  formatLong = () => {
    return dateFormater.formatFrLong(new Date(dateFormater.formatEn(this.selectedDate)));
  }

  selectDate = (e) => { 
    this.shadowRoot.querySelectorAll('.selected')
    let newDay = e.target.innerHTML;
    this.setAttribute('date', [("0" + newDay).slice(-2), ("0" + this.month).slice(-2), this.year].join('/'));
    this.closeModal(e);
  }

  highLightDay = () => {
    let date = this.getAttribute('date') ?? dateFormater.formatFr(new Date());
    let year = parseInt(date.slice(6, 10));
    let month = parseInt(date.slice(3, 5));
    if(this.year == year && this.month == month) return this.day;
    else return false;
  }

  openModal = () => {
    if (this.shadowRoot.querySelector('.--is-open')) return;

    // CSS Logic
    this.shadowRoot.getElementById('modal').classList.add('--is-open');

    setTimeout(() => { // Sync with transition-delay
      // Long date format when opening modal
      this.shadowRoot.getElementById('selectedDate').innerHTML = this.formatLong();

      // Append modal content
      this.shadowRoot.getElementById('content').appendChild(document.importNode(document.getElementById('modal-content').content, true));

      // Arrow listeners
      this.shadowRoot.getElementById('leftArrow').onclick = this.subMonth;
      this.shadowRoot.getElementById('rightArrow').onclick = this.addMonth;

      // Render days of the month
      this.renderDays()
    }, 200);

    // Events to close modal
    document.addEventListener('click', this.closeModal);
    document.addEventListener('keydown', this.closeModal);
  }

  closeModal = (e) => {
    if (e.composedPath().indexOf(this) == -1 || e.keyCode == (window.event ? 27 : e.DOM_VK_ESCAPE)) {
      e.stopPropagation()
      this.shadowRoot.getElementById('modal').classList.remove('--is-open');

      // Reset date if no date selected
      this.selectedDate = this.getAttribute('date') ?? dateFormater.formatFr(new Date());

      // Shorten date format
      setTimeout(() => {
        this.shadowRoot.getElementById('selectedDate').innerHTML = dateFormater.formatFr(new Date(dateFormater.formatEn(this.selectedDate)));
      }, 200);

      // Clean events
      document.removeEventListener('click', this.closeModal);
      document.removeEventListener('keydown', this.closeModal);

      // Clean modal content 
      this.shadowRoot.getElementById('content').innerHTML = '';
    }
  }
}

customElements.define("date-picker", DatePicker);


