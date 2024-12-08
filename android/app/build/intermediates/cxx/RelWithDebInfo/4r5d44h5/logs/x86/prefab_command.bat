@echo off
"C:\\Program Files\\Java\\jdk-17\\bin\\java" ^
  --class-path ^
  "C:\\Users\\defet\\.gradle\\caches\\modules-2\\files-2.1\\com.google.prefab\\cli\\2.1.0\\aa32fec809c44fa531f01dcfb739b5b3304d3050\\cli-2.1.0-all.jar" ^
  com.google.prefab.cli.AppKt ^
  --build-system ^
  cmake ^
  --platform ^
  android ^
  --abi ^
  x86 ^
  --os-version ^
  24 ^
  --stl ^
  c++_shared ^
  --ndk-version ^
  26 ^
  --output ^
  "C:\\Users\\defet\\AppData\\Local\\Temp\\agp-prefab-staging17427230500655601647\\staged-cli-output" ^
  "C:\\Users\\defet\\.gradle\\caches\\8.10.2\\transforms\\99a0bcb9fe09bb40ef601f3ea83de975\\transformed\\react-android-0.76.3-release\\prefab" ^
  "C:\\RN_Projects\\godesk_engineer\\android\\app\\build\\intermediates\\cxx\\refs\\react-native-reanimated\\22735s4e" ^
  "C:\\Users\\defet\\.gradle\\caches\\8.10.2\\transforms\\598741ec1a3ac25bb30c7fc77899deaf\\transformed\\hermes-android-0.76.3-release\\prefab" ^
  "C:\\Users\\defet\\.gradle\\caches\\8.10.2\\transforms\\d31f451122629a882eaa4d4e39fe5824\\transformed\\fbjni-0.6.0\\prefab"
