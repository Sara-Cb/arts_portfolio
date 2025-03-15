import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import {
    faHome,
    faFolder,
    faUser,
    faMagnifyingGlass,
    faBars,
    faTimes,
    faImage,
    faA,
    faChevronDown,
    faChevronUp,
    faQuoteLeft,
    faQuoteRight,
    faPhone,
    faEnvelope

} from '@fortawesome/free-solid-svg-icons'

import { faInstagram, faLinkedin, faWhatsapp } from '@fortawesome/free-brands-svg-icons'


library.add(faHome, faUser, faFolder, faMagnifyingGlass, faBars, faTimes, faImage, faA, faChevronDown, faChevronUp, faQuoteLeft, faQuoteRight, faPhone, faEnvelope, faInstagram, faLinkedin, faWhatsapp)

export default FontAwesomeIcon