import Api from './api';


class Address {

    private static END_POINT = '/address/';

    public static async get(address: string){

        const endPoint = `${this.END_POINT}${address}`
        const response = Api.get(endPoint);

        console.log(response);

        return response;

    }

}

export default Address;
