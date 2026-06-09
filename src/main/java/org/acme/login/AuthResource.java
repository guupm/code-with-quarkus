package org.acme.login;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.net.URI;
import java.io.InputStream;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import io.vertx.ext.web.RoutingContext;

import java.util.Map;
import java.util.UUID;
import java.nio.file.Paths;

// RESTEasy Reactive를 사용하는 경우 (Quarkus 기본)
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

@Path("/") // 기본 경로가 최상위 /
public class AuthResource {

    @Inject
    RoutingContext context;   // Quarkus Vert.x 세션 접근

    // ==========================================
    // 메인 페이지 & 로그인 영역
    // ==========================================
    
    @GET
    @Produces(MediaType.TEXT_HTML)
    public Response mainPage() {
        String loginUser = context.session().get("loginUser");

        System.out.println("=== [GET /] 세션 ID : " + context.session().id());
        System.out.println("=== [GET /] loginUser : " + loginUser);

        String htmlPath = (loginUser != null)
            ? "META-INF/resources/login/main_after_login.html"
            : "META-INF/resources/main_index.html";

        InputStream html = getClass().getClassLoader().getResourceAsStream(htmlPath);
        return Response.ok(html).build();
    }

    // GET /login → 로그인 HTML 페이지 반환 (로그인 상태면 메인으로 리다이렉트)
    @GET
    @Path("/login")
    @Produces(MediaType.TEXT_HTML)
    public Response loginPage() {
        // 1. 현재 세션에 로그인한 유저 정보가 있는지 확인합니다.
        String loginUser = context.session().get("loginUser");

        // 2. 이미 로그인된 상태라면 로그인 창 대신 메인 페이지인 "/after_login"으로 튕겨냄
        if (loginUser != null) {
            return Response.seeOther(URI.create("/after_login")).build();
        }

        // 3. 로그인이 안 되어 있을 때만 정상적으로 로그인 창을 띄워줍니다.
        InputStream html = getClass()
            .getClassLoader()
            .getResourceAsStream("META-INF/resources/login/login.html");
        return Response.ok(html).build();
    }

    @POST // 아이디, 패스워드 전송받음
    @Path("/login_check")
    @Transactional
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Response loginCheck(
        @FormParam("username") String username,
        @FormParam("password") String password) {

        User user = User.findByUsername(username); // 아이디 조회
        if (user == null || !user.password.equals(password)) { // 존재 확인
            return Response.seeOther(URI.create("/login?error=1")).build();
        }

        // 세션에 로그인 정보 저장
        context.session().put("loginUser", username);

        return Response.seeOther(URI.create("/after_login")).build();
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
            // 세션 없음 → 로그인 페이지로 강제 이동
            return Response.seeOther(URI.create("/login")).build();
        }

        // 세션 있음 → 로그인 후 HTML 반환
        InputStream html = getClass()
            .getClassLoader()
            .getResourceAsStream("META-INF/resources/login/main_after_login.html");

        return Response.ok(html).build();
    }

    // next 쿼리 파라미터를 받아 동적으로 리다이렉트 처리하는 로그아웃
    @GET
    @Path("/logout")
    public Response logout(@QueryParam("next") String next) {
        // 로그아웃 전 세션 정보 출력 (디버깅용 - 필요시 삭제 가능)
        System.out.println("=== 로그아웃 전 세션 ID : " + context.session().id());
        System.out.println("=== 로그아웃 전 loginUser : " + context.session().get("loginUser"));

        // 세션 전체 삭제
        context.session().destroy();

        // next 파라미터가 "login"이면 로그인 페이지로, 아니면 메인 페이지로 이동
        String redirect = (next != null && next.equals("login")) ? "/login" : "/";
        return Response.seeOther(URI.create(redirect)).build();
    }
    
    // ==========================================
    // 회원가입 영역
    // ==========================================

    @GET
    @Path("/register")
    @Produces(MediaType.TEXT_HTML)
    public Response registerPage() {
        InputStream html = getClass()
            .getClassLoader()
            .getResourceAsStream("META-INF/resources/login/register.html");
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

        // ① 아이디 중복체크
        if (User.findByUsername(username) != null) {
            return Response.seeOther(URI.create("/register?error=duplicate_username")).build();
        }

        // ② 이메일 중복체크
        if (User.findByEmail(email) != null) {
            return Response.seeOther(URI.create("/register?error=duplicate_email")).build();
        }

        // ③ DB 삽입
        User newUser = new User();
        newUser.username = username;
        newUser.password = password;   // 해시값 저장
        newUser.email    = email;
        newUser.phone    = phone;
        newUser.persist();

        // ④ 가입완료 페이지로 이동
        return Response.seeOther(URI.create("/register_success")).build();
    }

    @GET
    @Path("/register_success")
    @Produces(MediaType.TEXT_HTML)
    public Response registerSuccess() {
        InputStream html = getClass()
            .getClassLoader()
            .getResourceAsStream("META-INF/resources/login/register_success.html");
        return Response.ok(html).build();
    }

    // ==========================================
    // 프로필 (마이페이지) 영역
    // ==========================================

    @GET
    @Path("/profile")
    @Produces(MediaType.TEXT_HTML)
    public Response profilePage() {

        // ① 세션체크 (로그인 안 한 사용자 차단)
        String loginUser = context.session().get("loginUser");
        if (loginUser == null) {
            return Response.seeOther(URI.create("/login")).build();
        }

        // ② DB에서 사용자 정보 조회
        User user = User.findByUsername(loginUser);

        // ③ 세션에 사용자 정보 저장 (HTML에서 활용)
        context.session().put("userEmail", user.email);
        context.session().put("userPhone", user.phone);
        context.session().put("profileImage",
            user.profileImage != null ? user.profileImage : "default.png");

        // ④ 프로필 페이지 반환
        InputStream html = getClass()
            .getClassLoader()
            .getResourceAsStream("META-INF/resources/login/profile.html");
        return Response.ok(html).build();
    }
    
    @GET
    @Path("/profile/info")
    @Produces(MediaType.APPLICATION_JSON)
    public Response profileInfo() {

        // 세션체크
        String loginUser = context.session().get("loginUser");
        if (loginUser == null) {
            return Response.status(401).build();
        }

        // DB 조회
        User user = User.findByUsername(loginUser);

        // JSON 응답
        return Response.ok(
            Map.of(
                "username",     user.username,
                "email",        user.email != null ? user.email : "",
                "phone",        user.phone != null ? user.phone : "",
                "profileImage", user.profileImage != null ? user.profileImage : ""
            )
        ).build();
    }

    @POST
    @Path("/profile/upload")
    @Transactional
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response profileUpload(@RestForm("profileImage") FileUpload file) {

        // ① 세션체크
        String loginUser = context.session().get("loginUser");
        if (loginUser == null) {
            return Response.seeOther(URI.create("/login")).build();
        }

        try {
            // ② 확장자 검사
            String original = file.fileName();
            String ext = original.substring(original.lastIndexOf('.') + 1).toLowerCase();
            
            if (!ext.matches("jpg|jpeg|png|gif|webp")) {
                return Response.seeOther(URI.create("/profile?error=invalid_type")).build();
            }
            
            // ③ 파일크기 검사(5MB)
            if (file.size() > 5 * 1024 * 1024) {
                return Response.seeOther(URI.create("/profile?error=too_large")).build();
            }
            
            // ④ UUID 파일명 생성 + 저장
            String newFileName = UUID.randomUUID() + "." + ext;
            java.nio.file.Path uploadDir = Paths.get(
                "src/main/resources/META-INF/resources/uploads/profile");
            java.nio.file.Files.createDirectories(uploadDir);
            java.nio.file.Files.copy(file.uploadedFile(),
                uploadDir.resolve(newFileName),
                java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                
            // ⑤ DB 업데이트
            User user = User.findByUsername(loginUser);
            user.profileImage = newFileName;

            return Response.seeOther(URI.create("/profile")).build();
            
        } catch (Exception e) {
            return Response.seeOther(URI.create("/profile?error=upload_fail")).build();
        }
    }

    @POST
    @Path("/profile/update")
    @Transactional
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Response profileUpdate(
        @FormParam("email") String email,
        @FormParam("phone") String phone) {
        
        // ① 세션체크
        String loginUser = context.session().get("loginUser");
        if (loginUser == null) {
            return Response.seeOther(URI.create("/login")).build();
        }
        
        // ② 이메일 중복체크 (본인 제외)
        User found = User.findByEmail(email);
        if (found != null && !found.username.equals(loginUser)) {
            return Response.seeOther(URI.create("/profile?error=duplicate_email")).build();
        }
        
        // ③ DB 업데이트
        User user = User.findByUsername(loginUser);
        user.email = email;
        user.phone = phone;
        
        return Response.seeOther(URI.create("/profile?success=updated")).build();
    }

    // 프로필 비밀번호 변경 기능
    @POST
    @Path("/profile/password")
    @Transactional
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Response profilePassword(
        @FormParam("currentPassword") String currentPassword,
        @FormParam("newPassword")     String newPassword) {
            
        // ① 세션체크
        String loginUser = context.session().get("loginUser");
        if (loginUser == null) {
            return Response.seeOther(URI.create("/login")).build();
        }
        
        // ② 현재 비밀번호 확인 (해시값 비교)
        User user = User.findByUsername(loginUser);
        if (!user.password.equals(currentPassword)) {
            return Response.seeOther(URI.create("/profile?error=wrong_password")).build();
        }
        
        // ③ 새 비밀번호로 DB 업데이트
        user.password = newPassword;
        
        return Response.seeOther(URI.create("/profile?success=password_changed")).build();
    }
}