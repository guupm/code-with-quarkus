package org.acme.login;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.net.URI;
import java.io.InputStream;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import io.vertx.ext.web.RoutingContext;

@Path("/") // 기본경로가최상위/
public class AuthResource {
    
    @GET
    @Produces(MediaType.TEXT_HTML)
    public Response mainPage() {
        String loginUser = context.session().get("loginUser");

        System.out.println("=== [GET /] 세션 ID : " + 
    context.session().id());
        System.out.println("=== [GET /] loginUser : " + loginUser);

    String htmlPath = (loginUser != null)
        ? "META-INF/resources/login/main_after_login.html"
        : "META-INF/resources/main_index.html";

        InputStream html = 
    getClass().getClassLoader().getResourceAsStream(htmlPath);
        return Response.ok(html).build();
    }


    // GET /login → 로그인HTML 페이지반환
    @GET
    @Path("/login") // 경로명시
    @Produces(MediaType.TEXT_HTML) // 서버→클라
    public Response loginPage() {
        InputStream html = getClass()
            .getClassLoader()
            .getResourceAsStream("META-INF/resources/login/login.html");
        return Response.ok(html).build();
    }

    @Inject
    RoutingContext context;   // Quarkus Vert.x 세션 접근

    @POST // 아이디, 패스워드 전송받음
    @Path("/login_check")
    @Transactional
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Response loginCheck(
        @FormParam("username") String username,
        @FormParam("password") String password) {

        User user = User.findByUsername(username); // 아이디 조회
            if (user == null || !user.password.equals(password)) { // 존재 확인
        return Response
            .seeOther(URI.create("/login?error=1"))
            .build();
        }

    // 세션에 로그인 정보 저장
    context.session().put("loginUser", username);

    return Response
        .seeOther(URI.create("/after_login"))
        .build();
    }

    @GET
    @Path("/after_login")
    @Produces(MediaType.TEXT_HTML)
    public Response afterLogin() {

        // 세션 체크: 로그인 안 한 사용자 차단
        String loginUser = context.session().get("loginUser");

        // 세션 내용 로그 출력
        System.out.println("=== 세션 ID : " + context.session().id());
        System.out.println("=== loginUser : " + loginUser);

        if (loginUser == null) {
            // 세션 없음 → 로그인 페이지로강제이동
            return Response
                .seeOther(URI.create("/login"))
                .build();
        }

    // 세션 있음 → 로그인 후 HTML 반환
        InputStream html = getClass()
            .getClassLoader()
            .getResourceAsStream("META-INF/resources/login/main_after_login.html");

        return Response.ok(html).build();
    }

    @GET
    @Path("/logout")
    public Response logout() {

        // 로그아웃 전 세션 정보출력
        System.out.println("=== 로그아웃 전 세션 ID : " + context.session().id());
        System.out.println("=== 로그아웃 전 loginUser : " + context.session().get("loginUser"));

        // 세션 전체 삭제
        context.session().destroy();
        
        // 로그아웃 후 세션 정보출력
        System.out.println("=== 로그아웃 후 세션 ID : " + context.session().id());
        System.out.println("=== 로그아웃 후 loginUser : " + context.session().get("loginUser"));

        return Response
            .seeOther(URI.create("/"))
            .build();
    }
    
    @GET
    @Path("/register")
    @Produces(MediaType.TEXT_HTML)
    public Response registerPage() {
        InputStream html = getClass()
            .getClassLoader()
            .getResourceAsStream(
            "META-INF/resources/login/register.html");
        return Response.ok(html).build();
    }

    @POST
    @Path("/register_check")
    @Transactional
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_HTML)
    public Response registerCheck(
        @FormParam("username") String username,
        @FormParam("password") String password,  // SHA-256 해시값
        @FormParam("email")    String email,
        @FormParam("phone")    String phone) {

    // ①아이디중복체크
    if (User.findByUsername(username) != null) {
        return Response
            .seeOther(URI.create("/register?error=duplicate_username"))
            .build();
    }

    // ②이메일중복체크
    if (User.findByEmail(email) != null) {
        return Response
            .seeOther(URI.create("/register?error=duplicate_email"))
            .build();
    }

    // ③DB 삽입
    User newUser = new User();
    newUser.username = username;
    newUser.password = password;   // 해시값저장
    newUser.email    = email;
    newUser.phone    = phone;
    newUser.persist();

    // ④가입완료페이지로이동
    return Response
        .seeOther(URI.create("/register_success"))
        .build();
    }

    @GET
    @Path("/register_success")
    @Produces(MediaType.TEXT_HTML)
    public Response registerSuccess() {
        InputStream html = getClass()
            .getClassLoader()
            .getResourceAsStream(
            "META-INF/resources/login/register_success.html");
        return Response.ok(html).build();
    }

    @GET
    @Path("/profile")
    @Produces(MediaType.TEXT_HTML)
    public Response profilePage() {

        // ①세션체크(로그인안한사용자차단)
        String loginUser = context.session().get("loginUser");
        if (loginUser == null) {
            return Response
                .seeOther(URI.create("/login"))
                .build();
        }

        // ②DB에서사용자정보조회
        User user = User.findByUsername(loginUser);

        // ③세션에사용자정보저장(HTML에서활용)
        context.session().put("userEmail", user.email);
        context.session().put("userPhone", user.phone);
        context.session().put("profileImage",
            user.profileImage != null ? user.profileImage : "default.png");

        // ④프로필페이지반환
        InputStream html = getClass()
            .getClassLoader()
            .getResourceAsStream(
            "META-INF/resources/login/profile.html");
        return Response.ok(html).build();
    }
    
    @GET
    @Path("/profile/info")
    @Produces(MediaType.APPLICATION_JSON)
    public Response profileInfo() {

    // 세션체크
    String loginUser= context.session().get("loginUser");
    if (loginUser== null) {
        return Response.status(401).build();
    }

    // DB 조회
    User user= User.findByUsername(loginUser);

    // JSON 응답
    return Response.ok(
        Map.of(
            "username",     user.username,
            "email",        user.email != null ? user.email : "",
            "phone",        user.phone != null ? user.phone : "",
            "profileImage", user.profileImage!= null
                ? user.profileImage: ""
            )
        ).build();
    }

    @POST
    @Path("/profile/upload")
    @Transactional
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response profileUpload(
    @RestForm("profileImage") FileUpload file) {

    // ①세션체크
    String loginUser= context.session().get("loginUser");
    if (loginUser== null) {
        return Response
            .seeOther(URI.create("/login"))
            .build();
    }

    try {
    // ②확장자검사
    String original = file.fileName();
    String ext= original.substring(
        original.lastIndexOf('.') + 1).toLowerCase();
        if (!ext.matches("jpg|jpeg|png|gif|webp")) {
            return Response
                .seeOther(URI.create("/profile?error=invalid_type"))
                .build();
            }
    // ③파일크기검사(5MB)
    if (file.size() > 5 * 1024 * 1024) {
        return Response
            .seeOther(URI.create("/profile?error=too_large"))
            .build();
        }
    // ④UUID 파일명생성+ 저장
    String newFileName= UUID.randomUUID() + "." + ext;
    java.nio.file.PathuploadDir= Paths.get(
        "src/main/resources/META-INF/resources/uploads/profile");
    java.nio.file.Files.createDirectories(uploadDir);
    java.nio.file.Files.copy(file.uploadedFile(),
        uploadDir.resolve(newFileName),
        java.nio.file.StandardCopyOption.REPLACE_EXISTING);
    // ⑤DB 업데이트
    User user= User.findByUsername(loginUser);
    user.profileImage= newFileName;
    return Response
    .seeOther(URI.create("/profile"))
    .build();
    } catch (Exception e) {
        return Response
            .seeOther(URI.create("/profile?error=upload_fail"))
            .build();
        }
    }
}