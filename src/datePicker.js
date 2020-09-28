let dateFormater = {
  Week : {
    'fr-FR' : {
      'long' : ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
      'short': ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'],
      'narrow': ['L', 'M', 'M', 'J', 'V', 'S', 'D']
    }
  },

  Month : {
    'fr-FR' : {
      'long' : ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
      'short' : ['Jan.', 'Fev.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Jui.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
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
    year = array[2];
    month = array[1];
    day = array[0];
    return [month, day, year].join('/');
  },

  numberOfDay(year, month) {
    return new Date(year ?? this.getFullYear(), month ?? (this.getMonth()+1), 0).getDate();
  },

   /**
   * @param {Number} year - the requested year
   * @param {Number} month - of the request month
   * @param {Object} option - format type 
   */
  firstDayOfMonth(dirtyYear, dirtyMonth, dirtyOption) {
    let year = dirtyYear ?? this.getFullYear();
    let month = dirtyMonth - 1 ?? this.getMonth();
    let option = dirtyOption ?? {};
    let firstDay = new Date(year ?? this.getFullYear(), month, 1).toLocaleString("default", {weekday: 'long'});
    return option.format == 'numeric' ? this.Week['fr-FR'].long.indexOf((firstDay+'').charAt(0).toUpperCase()+firstDay.substr(1)) : firstDay;
  }
}

class DatePicker extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({mode:'open'});
    const template = document.importNode(document.getElementById('template').content, true);
    root.appendChild(template);

    this.startDate = this.getAttribute('date') ?? dateFormater.formatFr(new Date())
  }

  connectedCallback() {
    // append startDate
    this.shadowRoot.getElementById('selectedDate').innerHTML = this.startDate;
    this.addEventListener('click', this.openModal);
  }

  openModal = () => {
    this.shadowRoot.getElementById('modal').classList.add('--is-open');

    // Long date format when opening modal
    setTimeout(() => {
      this.shadowRoot.getElementById('selectedDate').innerHTML = dateFormater.formatFrLong(new Date(dateFormater.formatEn(this.startDate)));
    }, 200);
    
    // Events to close modal
    document.addEventListener('click', this.closeModal);
    document.addEventListener('keydown', this.closeModal);
  }

  closeModal = (e) => {
    if(e.composedPath().indexOf(this) == -1 || e.keyCode == (window.event ? 27 : e.DOM_VK_ESCAPE)) {
      this.shadowRoot.getElementById('modal').classList.remove('--is-open');

      // Shorten date format
      setTimeout(() => {
        this.shadowRoot.getElementById('selectedDate').innerHTML = dateFormater.formatFr(new Date(dateFormater.formatEn(this.startDate)));
      }, 200);
      
      // Clean events
      document.removeEventListener('click', this.closeModal);
      document.removeEventListener('keydown', this.closeModal);
    }
  }

  renderDays = (month) => {
    this.shadowRoot.getElementById('dayContainer')
  }
}

customElements.define("date-picker", DatePicker);


