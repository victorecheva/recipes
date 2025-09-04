export default class User {
  id: number;
  username: string;
  constructor(_username: string, _id: number){
    this.id = _id;
    this.username = _username;
  }
}