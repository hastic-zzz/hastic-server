%define name hastic-server
%define version 0.2.6_alpha_%{echo $RPM_RELEASE}
%define release 0
%define buildroot %(mktemp -ud %{_tmppath}/server/%{name}-%{version}-%{release}-XXXXXX)

Name: %{name}
Version: %{version}
Release: %{release}
Summary: hastic-server

Group: Installation Script
License: Apache-2.0
URL: hastic.io
BuildRoot: %{buildroot}
Requires: nodejs >= 6, python3
BuildRequires: nodejs
AutoReqProv: no

%description
REST server for managing data for analytics

%prep
mkdir -p %{buildroot}
cp -r ../server %{buildroot}
cp -r ../analytics %{buildroot}

%build
pushd %{buildroot}/server
npm prune --production
npm rebuild
popd

pushd %{buildroot}/analytics
pip3.6 install -r requirements.txt
pip3.6 install pyinstaller
pyinstaller --additional-hooks-dir=pyinstaller_hooks --paths=analytics/ bin/server
popd


%pre
getent group hastic-server >/dev/null || groupadd -r hastic-server
getent passwd hastic-server >/dev/null || useradd -r -g hastic-server -G hastic-server -d / -s /sbin/nologin -c "hastic-server" hastic-server

%install
mkdir -p %{buildroot}/usr/lib/hastic-server
cp -r ./ %{buildroot}/usr/lib/hastic-server

%post
systemctl enable /usr/lib/hastic-server/hastic-server.service

%clean
rm -rf %{buildroot}

%files
%defattr(644, hastic-server, hastic-server, 755)
/usr/lib/hastic-server
