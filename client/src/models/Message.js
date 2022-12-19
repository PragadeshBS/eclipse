class Message {
  constructor(content, isAuthor) {
    this.content = content;
    this.isAuthor = isAuthor;
  }
  getMessage() {
    return this.content;
  }
}

export default Message;
