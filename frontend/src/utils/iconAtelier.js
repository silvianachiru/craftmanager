import artIcon from '../assets/art.png'
import pencilIcon from '../assets/pencil.png'
import cameraIcon from '../assets/camera.png'
import potteryIcon from '../assets/pottery.png'
import diamondIcon from '../assets/diamond.png'
import ropeIcon from '../assets/rope.png'
import woodIcon from '../assets/wood.png'
import cakeIcon from '../assets/cake.png'
import chefHatIcon from '../assets/chef-hat.png'
import breadsIcon from '../assets/breads.png'
import lotusIcon from '../assets/lotus.png'
import openBookIcon from '../assets/open-book.png'
import microphoneIcon from '../assets/microphone.png'
import guitarIcon from '../assets/guitar.png'
import dancingIcon from '../assets/dancing.png'

const iconPeTema = {
  'Pictura acrilica': artIcon,
  'Acuarela': artIcon,
  'Desen in creion': pencilIcon,
  'Fotografie': cameraIcon,
  'Ceramica': potteryIcon,
  'Bijuterii handmade': diamondIcon,
  'Macrame': ropeIcon,
  'Decor din lemn': woodIcon,
  'Cofetarie': cakeIcon,
  'Gatit international': chefHatIcon,
  'Brutarie artizanala': breadsIcon,
  'Mindfulness': lotusIcon,
  'Scriere creativa': openBookIcon,
  'Public speaking': microphoneIcon,
  'Chitara pentru incepatori': guitarIcon,
  'Dans salsa': dancingIcon,
}

export function getIconAtelier(atelier) {
  return iconPeTema[atelier.tema?.denumire] || artIcon
}
