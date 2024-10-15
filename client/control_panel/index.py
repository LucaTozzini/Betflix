import sys
import time
import socket
import threading

from zeroconf import ServiceBrowser, ServiceListener, Zeroconf
import requests
from PyQt6.QtCore import QSize, Qt, pyqtSignal, QObject
from PyQt6.QtWidgets import QApplication, QVBoxLayout, QMainWindow, QLabel, QWidget, QPushButton

SERVER_ADDRESS = None

# A custom signal class to notify the main thread
class Signals(QObject):
    server_found = pyqtSignal()

# The signal object to be used across threads
signals = Signals()


def findServer():
    global SERVER_ADDRESS
    def check(address, port):
        global SERVER_ADDRESS
        r = requests.get('http://'+address+":"+str(port)+"/ciao")
        if r.text == "yellow":
            SERVER_ADDRESS = address+":"+str(port)

    class MyListener(ServiceListener):
        def add_service(self, zc: Zeroconf, type_: str, name: str) -> None:
            info = zc.get_service_info(type_, name)
            if name == "Betflix_Server._http._tcp.local.":
                for address in info.addresses:
                    ipv4_address = socket.inet_ntoa(address)
                    check(ipv4_address, info.port)

    ServiceBrowser(Zeroconf(), "_http._tcp.local.", MyListener())
    print("mDNS-sd start")
    while SERVER_ADDRESS == None:
        time.sleep(1)
    signals.server_found.emit()
    print("mDNS-sd stop")

# Subclass QMainWindow to customize your application's main window
class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()

        self.setWindowTitle("Control Panel | Betflix")
        self.setMinimumSize(QSize(300, 300))
        
        self.layout = QVBoxLayout()
        self.container = QWidget()
        self.container.setLayout(self.layout)
        self.container.setStyleSheet("background-color: black; color: fuchsia")
        
        self.address = QLabel("Server mDNS-ds in progress...")
        self.startStop = QPushButton("Stop Server")
        self.address.setStyleSheet("background-color: green")

        self.layout.addWidget(self.address)
        self.layout.addWidget(self.startStop)

    
        # Set the central widget of the Window.
        self.setCentralWidget(self.container)

        # Connect the signal to the update method
        signals.server_found.connect(self.updateAddress)

    def updateAddress(self):
        self.address.setText(f"Server found @ {SERVER_ADDRESS}")


app = QApplication(sys.argv)
window = MainWindow()
window.showMaximized()

bonjourThread = threading.Thread(target=findServer, args=())
bonjourThread.start()

app.exec()

bonjourThread.join()