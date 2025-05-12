### esp-idf component sdcard



## Using the component

Run the following command in your ESP-IDF project to install this component:
```bash
idf.py add-dependency "javascript-2020/sdcard"
```

## Example

To run the provided example, create it as follows:

```bash
idf.py create-project-from-example "javascript-2020/sdcard:sdcard-test"
```

Then build as usual:
```bash
cd sdcard-test
idf.py build
```

And flash it to the board:
```bash
idf.py -p PORT flash monitor
```

## License

This component is provided under Apache 2.0 license, see [LICENSE](LICENSE.md) file for details.

## Contributing

Please check [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.






