export const status_socket = {
  clients: new Set(),
  sub: function (client) {
    this.clients.add(client);
  },
  unsub: function (client) {
    this.clients.delete(client);
  },
  notify: function (data) {
    for (const client of this.clients) {
      if (client.readyState === 1) {
        client.send(data);
      }
    }
  },
};
