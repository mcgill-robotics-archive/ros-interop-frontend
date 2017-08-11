# ROS Interop Frontend

This is an Electron application client to interface with the
[`interop` package](https://github.com/mcgill-robotics/ros-interop.git).

## Setting up

You must clone this repository as `interop-frontend` into your catkin workspace:

```bash
git clone https://github.com/mcgill-robotics/ros-interop-frontend.git interop-frontend
```

You must also follow all the intructions for the
[`interop` package](https://github.com/mcgill-robotics/ros-interop.git).

## Dependencies

Before proceeding, make sure to install all the dependencies by running:

```bash
rosdep update
rosdep install -y --from-paths interop-frontend
```

## Compiling

You **must** compile this package before being able to run it. This will
install all `npm` dependencies, so an internet connection is required the first
time. You can do so by running:

```bash
catkin_make
```

from the root of your workspace.

On Ubuntu, you might also need to symlink `nodejs` to `node` for this to work.
This can be done as follows:

```bash
sudo ln -s /usr/bin/nodejs /usr/bin/node
```

## Running the server
For this frontend to communicate with the ROS `interop` client, you will need to
run the `rosbridge_server` alongside the `interop` client. This can be done by
simply following the `interop`'s instructions and also running:

```bash
roslaunch rosbridge_server rosbridge_websocket.launch
```

in another terminal. The address or hostname of the machine running this server
will need to be known and port `9090` will need to be open for the frontend to
reach it.

## Running this frontend

### Running in ROS
```bash
rosrun interop_frontend interop_frontend
```

You will be prompted for an address or hostname on startup. This is the address
`rosbridge_server` should be running on.

### Running Dev Server
```bash
npm install
npm run dev
```

### Building and Running Production
```bash
npm install
npm run build
npm run start
```

## Credits
This application was based on
[hahoocn's boilerplate](https://github.com/hahoocn/react-electron-boilerplate.git).
