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

## Running

### Running Dev Server
````
npm run dev
````

### Building and Running Production
````
npm run build
npm run start
````

## Credits
This application was based on [hahcoon's boilerplate]
(https://github.com/hahcoon/react-electron-boilerplate.git).
