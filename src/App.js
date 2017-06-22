import React from 'react';
import logo from './logo.svg';
import './App.css';
import tree from './libs/tree';
import serviceProviderFactory from './libs/service-provider';
import services  from './services';
import CounterList from './components/counter-list';
import People from './components/people';

const ServiceProvider = serviceProviderFactory(services);

export default function () {
    return (
        <div className="App">
            <div className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <h2>Welcome to React</h2>
            </div>
            <p className="App-intro">
                To get started, edit <code>src/App.js</code> and save to reload.
            </p>
            <CounterList tree={tree.counter} />
            <ServiceProvider
                token='some text token'
            >
                <People tree={tree.starWars} />
            </ServiceProvider>
        </div>
    );
}
