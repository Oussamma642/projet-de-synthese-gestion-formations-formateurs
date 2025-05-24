<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>

    <!-- <h1>Pour generer crsf 1</h1> -->

    <!-- Methode 1 -->
    <!-- <div class="container mt-5">
        <form action="/" method="post">
            @csrf
            <div class="row">
                <div class="form-group col-6 lg">
                    <label>Prénom & Nom</label>
                    <input type="text" class="form-control" name="prenomNom" id="prenomNom">
                </div>
                <div class="form-group col-6 lg">
                    <label>Email</label>
                    <input type="email" class="form-control" name="email" id="email">
                </div>
            </div>

            <div class="row">
                <div class="form-group col-12 lg">
                    <label>Message</label>
                    <textarea class="form-control" name="message" id="message" rows="4"></textarea>
                </div>
            </div>
            <input type="submit" name="send" value="Submit" class="btn btn-primary btn-block">

        </form>

    </div> -->

    <!-- <h1>Pour generer crsf 2</h1> -->
    <!-- Methode 2 -->
    <!-- <div class="container mt-5">
        <form action="" method="post">
            <input type="hidden" name="_token" value="{{csrf_token ()}}">
            <div class="row">
                <div class="form-group col-6 lg">
                    <label>Prénom & Nom</label>
                    <input type="text" class="form-control" name="prenomNom" id="prenomNom">
                </div>
                <div class="form-group col-6 lg">
                    <label>Email</label>
                    <input type="email" class="form-control" name="email" id="email">
                </div>
            </div>

            <div class="row">
                <div class="form-group col-12 lg">
                    <label>Message</label>
                    <textarea class="form-control" name="message" id="message" rows="4"></textarea>
                </div>
            </div>
            <input type="submit" name="send" value="Submit" class="btn btn-primary btn-block">

        </form>

    </div> -->

    <h1>Pour generer crsf 3</h1>
    <!-- Methode 3 -->
    <div class="container mt-5">
        <form action="" method="post">
            {{ csrf_field() }}
            <div class="row">
                <div class="form-group col-6 lg">
                    <label>Prénom & Nom</label>
                    <input type="text" class="form-control" name="prenomNom" id="prenomNom">
                </div>
                <div class="form-group col-6 lg">
                    <label>Email</label>
                    <input type="email" class="form-control" name="email" id="email">
                </div>
            </div>
            <div class="row">
                <div class="form-group col-12 lg">
                    <label>Message</label>
                    <textarea class="form-control" name="message" id="message" rows="4"></textarea>
                </div>
            </div>
            <input type="submit" name="send" value="Submit" class="btn btn-primary btn-block">
        </form>
    </div>
</body>

</html>