const socketObject = {
  clients: {},
  /**
   * @param {number} id
   * @param {} client
   */
  subSocket: function (id, client) {
    console.log("Subbing:", client)
    this.clients[id] = client;
  },
  /**
   * @param {WebSocket} client
   */
  unsubSocket: function (client) {
    delete this.clients[client];
  },
  notify: function (data) {
    const clients = Object.values(this.clients)
    console.log("Notify!", data);
    console.log("fellas:", clients);
    for (const client of clients) {
      // if (client.readyState === 1) {
      //   client.send(data);
      // }
    }
  },
};

export const status_socket = Object.create(socketObject);