import { promisify } from 'util';
import * as Zomato from 'zomato';


export class ZomatoClient {
  constructor() {
    this.client = Zomato.createClient({ userKey: '88034a0b3c7710bbbf65443ccb8fea3d' });
  }

  getCuisines() {
    console.log('cuisines')
  }
}
