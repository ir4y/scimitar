import React from 'react';
import _ from 'lodash';

function initServices(token, services) {
    let initializedServices = {};
    _.each(services, (service, name) => {
        initializedServices[name] = service(token);
    });
    return initializedServices;
}

export default function serviceProviderFactory(services) {

    class ServiceProvider extends React.Component {
        constructor(props) {
            super(props);
            this.services = initServices(props.token, services);
        }
        getChildContext() {
            return {
                services: this.services,
            };
        }

        componentWillReceiveProps(nextProps) {
            this.services = initServices(nextProps.token);
        }

        render() {
            const { token, ...props } = this.props; // eslint-disable-line
            return (
                <div {...props} />
            );
        }
    }

    let servicesShape = {};

    _.each(services, (service, name) => {
        servicesShape[name] = React.PropTypes.func.isRequired;
    });

    ServiceProvider.childContextTypes = {
        services: React.PropTypes.shape(servicesShape),
    };

    ServiceProvider.propTypes = {
        token: React.PropTypes.string.isRequired,
    };

    return ServiceProvider;
}
