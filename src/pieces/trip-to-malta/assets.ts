import picture1Url from './assets/picture1.jpg'
import picture2Url from './assets/picture2.jpg'
import picture3Url from './assets/picture3.jpg'

export interface TripToMaltaImage {
  id: 'harbor' | 'garden' | 'church'
  alt: string
  src: string
}

export const tripToMaltaImages: TripToMaltaImage[] = [
  {
    id: 'church',
    alt: 'Stone church facade in Malta beneath a vivid blue sky and flag.',
    src: picture3Url,
  },
  {
    id: 'garden',
    alt: 'Classical stone pavilion and fountain framed by trees in a Malta garden.',
    src: picture2Url,
  },
  {
    id: 'harbor',
    alt: 'Colorful harbor boat in Valletta floating on calm water at sunset.',
    src: picture1Url,
  },
]
