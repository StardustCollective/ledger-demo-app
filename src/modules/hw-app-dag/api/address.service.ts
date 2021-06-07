import Api from './api';


class Address {

    private static END_POINT = '/address/';

    public static async get(address: string){

        const endPoint = `${this.END_POINT}${address}`
        const response = Api.get(endPoint);

        return response;

    }

}

export default Address;
