### Mobx store with react context API
For redux alternative request an Issue

### Store example
```js
export default class SessionStore {
  pending = false;
  list = [];

  constructor() {
    makeAutoObservable(this);

    this.init();
  }

  // actions
  async getList() {
    const [err, data] = await apiService.get();

    if (err) throw err;

    runInAction(() => {
      this.list = data;
    });

    return data;
  }
}
```

#### Creating store
```js
const session = new SessionStore();
const SessionStoreContext = React.createContext(session);
```

### Importing in component
```js
import { SessionStoreContext } from '@store';
const {pending, session} = useContext(SessionStoreContext);
```


### Structure
```md
  /StoreModule
    /api-service.js
    /StoreModule.js
    /index.js # exporter helper
```

#### Info
- `api-service` file is service pushing requests and cattching errors. tye/catach notation user
- Api service include `/api/${route}` axios request params for each request